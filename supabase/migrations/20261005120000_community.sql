-- Browser roles have no direct access. Only the authenticated Edge API may
-- call these RPCs with its server-side service-role key.
create table public.gg_profiles (
  id uuid primary key,
  email text not null,
  name text not null check (length(name) between 1 and 80),
  role text not null default 'author' check (role in ('author','admin'))
);
create table public.gg_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.gg_profiles(id),
  title text not null,
  revision integer not null default 0,
  updated bigint not null
);
create index gg_drafts_owner on public.gg_drafts(user_id);
create table public.gg_revisions (
  draft_id uuid not null references public.gg_drafts(id),
  revision integer not null check (revision > 0),
  content jsonb not null,
  created bigint not null,
  primary key(draft_id,revision)
);
create table public.gg_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.gg_profiles(id),
  draft_id uuid not null,
  revision integer not null,
  title text not null,
  author text not null,
  content jsonb not null,
  story jsonb not null,
  status text not null default 'pending' check (status in ('pending','approved','changes_requested','rejected','unpublished')),
  note text not null default '',
  created bigint not null,
  updated bigint not null,
  unique(draft_id,revision),
  foreign key(draft_id,revision) references public.gg_revisions(draft_id,revision)
);
create unique index gg_one_public_version on public.gg_submissions(draft_id) where status='approved';
create index gg_submissions_owner on public.gg_submissions(user_id,created desc);
create index gg_submissions_status on public.gg_submissions(status,updated desc);
create table public.gg_moderation (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.gg_submissions(id),
  admin_id uuid not null references public.gg_profiles(id),
  decision text not null,
  note text not null,
  created bigint not null
);
create table public.gg_write_limits (
  user_id uuid primary key references public.gg_profiles(id),
  window_start timestamptz not null,
  count integer not null
);

alter table public.gg_profiles enable row level security;
alter table public.gg_drafts enable row level security;
alter table public.gg_revisions enable row level security;
alter table public.gg_submissions enable row level security;
alter table public.gg_moderation enable row level security;
alter table public.gg_write_limits enable row level security;
revoke all on public.gg_profiles, public.gg_drafts, public.gg_revisions,
  public.gg_submissions, public.gg_moderation, public.gg_write_limits from anon, authenticated;
grant all on public.gg_profiles, public.gg_drafts, public.gg_revisions,
  public.gg_submissions, public.gg_moderation, public.gg_write_limits to service_role;

create function public.gg_profile(p_user uuid, p_email text, p_name text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare profile public.gg_profiles;
begin
  insert into public.gg_profiles(id,email,name) values(p_user,p_email,left(p_name,80))
  on conflict(id) do update set email=excluded.email;
  select * into profile from public.gg_profiles where id=p_user;
  return jsonb_build_object('id',profile.id,'username',profile.email,'name',profile.name,'role',profile.role);
end; $$;

create function public.gg_throttle(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare used integer;
begin
  insert into public.gg_write_limits as limits values(p_user,now(),1)
  on conflict(user_id) do update set
    count=case when limits.window_start < now()-interval '1 minute' then 1 else limits.count+1 end,
    window_start=case when limits.window_start < now()-interval '1 minute' then now() else limits.window_start end
  returning count into used;
  if used > 120 then raise exception using errcode='P0429',message='Too many writes. Wait one minute before trying again.'; end if;
end; $$;

create function public.gg_save_draft(p_user uuid, p_id uuid, p_content jsonb, p_expected integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current public.gg_drafts; stamp bigint := floor(extract(epoch from clock_timestamp())*1000);
begin
  perform public.gg_throttle(p_user);
  if octet_length(p_content::text)>1000000 or length(coalesce(p_content->'story'->>'title','')) not between 1 and 200 then
    raise exception using errcode='P0400',message='Draft title or size is invalid.';
  end if;
  if p_id is null then
    insert into public.gg_drafts(user_id,title,updated) values(p_user,p_content->'story'->>'title',stamp) returning * into current;
  else
    select * into current from public.gg_drafts where id=p_id and user_id=p_user for update;
    if not found then raise exception using errcode='P0404',message='Draft not found in your account.'; end if;
    if p_expected is distinct from current.revision then raise exception using errcode='P0409',message='This draft changed on another device. Load its latest account version before saving.'; end if;
  end if;
  update public.gg_drafts set revision=current.revision+1,title=p_content->'story'->>'title',updated=stamp where id=current.id returning * into current;
  insert into public.gg_revisions values(current.id,current.revision,p_content,stamp);
  return jsonb_build_object('id',current.id,'revision',current.revision,'updated',stamp);
end; $$;

create function public.gg_read_drafts(p_user uuid, p_id uuid default null, p_revision integer default null, p_versions boolean default false)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current public.gg_drafts; content jsonb; selected integer;
begin
  if p_id is null then
    return jsonb_build_object('drafts',coalesce((select jsonb_agg(jsonb_build_object('id',id,'title',title,'revision',revision,'updated',updated) order by updated desc) from public.gg_drafts where user_id=p_user),'[]'::jsonb));
  end if;
  select * into current from public.gg_drafts where id=p_id and user_id=p_user;
  if not found then raise exception using errcode='P0404',message='Draft not found in your account.'; end if;
  if p_versions then
    return jsonb_build_object('versions',(select jsonb_agg(jsonb_build_object('revision',revision,'created',created) order by revision desc) from public.gg_revisions where draft_id=p_id));
  end if;
  selected := coalesce(p_revision,current.revision);
  select r.content into content from public.gg_revisions r where r.draft_id=p_id and r.revision=selected;
  if not found then raise exception using errcode='P0404',message='That saved version does not exist.'; end if;
  return jsonb_build_object('id',p_id,'revision',selected,'content',content);
end; $$;

create function public.gg_submit(p_user uuid, p_id uuid, p_revision integer, p_story jsonb, p_consent boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current public.gg_drafts; author public.gg_profiles; saved jsonb; result uuid; stamp bigint := floor(extract(epoch from clock_timestamp())*1000);
begin
  perform public.gg_throttle(p_user);
  if p_consent is distinct from true then raise exception using errcode='P0400',message='Confirm ownership and permission to publish.'; end if;
  select * into current from public.gg_drafts where id=p_id and user_id=p_user for update;
  if not found then raise exception using errcode='P0404',message='Draft not found in your account.'; end if;
  select content into saved from public.gg_revisions where draft_id=p_id and revision=p_revision;
  if not found then raise exception using errcode='P0404',message='That saved revision does not exist.'; end if;
  if exists(select 1 from public.gg_submissions where draft_id=p_id and revision=p_revision) then
    raise exception using errcode='P0409',message='This version was already submitted. Save a new version to resubmit.';
  end if;
  select * into author from public.gg_profiles where id=p_user;
  insert into public.gg_submissions(user_id,draft_id,revision,title,author,content,story,created,updated)
    values(p_user,p_id,p_revision,p_story->>'title',author.name,saved,p_story,stamp,stamp) returning id into result;
  return jsonb_build_object('id',result,'status','pending');
end; $$;

create function public.gg_catalog(p_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare entry public.gg_submissions;
begin
  if p_id is null then
    return jsonb_build_object('stories',coalesce((select jsonb_agg(listing order by updated desc) from
      (select id,title,author,revision,updated from public.gg_submissions where status='approved' order by updated desc limit 500) listing),'[]'::jsonb));
  end if;
  select * into entry from public.gg_submissions where id=p_id and status='approved';
  if not found then raise exception using errcode='P0404',message='That story is not published.'; end if;
  return jsonb_build_object('story',entry.story || jsonb_build_object('provenance',jsonb_build_object('kind','community','author',entry.author,'submissionId',entry.id,'revision',entry.revision)));
end; $$;

create function public.gg_read_submissions(p_user uuid, p_admin boolean default false, p_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare entry public.gg_submissions;
begin
  if p_admin and not exists(select 1 from public.gg_profiles where id=p_user and role='admin') then
    raise exception using errcode='P0403',message='Only the site administrator can review submissions.';
  end if;
  if p_id is not null then
    if not p_admin then raise exception using errcode='P0403',message='Administrator access is required.'; end if;
    select * into entry from public.gg_submissions where id=p_id;
    if not found then raise exception using errcode='P0404',message='Submission not found.'; end if;
    return jsonb_build_object('submission',to_jsonb(entry)-'story','history',
      coalesce((select jsonb_agg(jsonb_build_object('decision',decision,'note',note,'created',created) order by created) from public.gg_moderation where submission_id=p_id),'[]'::jsonb));
  end if;
  return jsonb_build_object('submissions',coalesce((select jsonb_agg(listing order by created desc) from
    (select id,title,author,revision,status,note,created,updated from public.gg_submissions where p_admin or user_id=p_user order by created desc limit 500) listing),'[]'::jsonb));
end; $$;

create function public.gg_moderate(p_user uuid, p_id uuid, p_decision text, p_note text, p_reviewed boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare entry public.gg_submissions; stamp bigint := floor(extract(epoch from clock_timestamp())*1000);
begin
  perform public.gg_throttle(p_user);
  if not exists(select 1 from public.gg_profiles where id=p_user and role='admin') then
    raise exception using errcode='P0403',message='Only the site administrator can review submissions.';
  end if;
  select * into entry from public.gg_submissions where id=p_id;
  if not found then raise exception using errcode='P0404',message='Submission not found.'; end if;
  -- Serialize approvals of different revisions belonging to the same draft.
  perform 1 from public.gg_drafts where id=entry.draft_id for update;
  if p_decision not in ('approved','changes_requested','rejected','unpublished') or p_decision is null
    or p_note is null or length(p_note)>2000 then raise exception using errcode='P0400',message='Invalid moderation decision or note.'; end if;
  if p_decision='approved' and p_reviewed is distinct from true then
    raise exception using errcode='P0400',message='Read the complete story and confirm your review before approving.';
  end if;
  if p_decision<>'approved' and length(trim(p_note))=0 then
    raise exception using errcode='P0400',message='Explain the decision to the author.';
  end if;
  if p_decision='approved' then
    update public.gg_submissions set status='unpublished',updated=stamp where draft_id=entry.draft_id and status='approved' and id<>p_id;
  end if;
  update public.gg_submissions set status=p_decision,note=trim(p_note),updated=stamp where id=p_id;
  insert into public.gg_moderation(submission_id,admin_id,decision,note,created) values(p_id,p_user,p_decision,trim(p_note),stamp);
  return jsonb_build_object('id',p_id,'status',p_decision);
end; $$;

revoke all on function public.gg_profile(uuid,text,text), public.gg_throttle(uuid),
  public.gg_save_draft(uuid,uuid,jsonb,integer), public.gg_read_drafts(uuid,uuid,integer,boolean),
  public.gg_submit(uuid,uuid,integer,jsonb,boolean), public.gg_catalog(uuid),
  public.gg_read_submissions(uuid,boolean,uuid), public.gg_moderate(uuid,uuid,text,text,boolean)
  from public, anon, authenticated;
grant execute on function public.gg_profile(uuid,text,text), public.gg_throttle(uuid),
  public.gg_save_draft(uuid,uuid,jsonb,integer), public.gg_read_drafts(uuid,uuid,integer,boolean),
  public.gg_submit(uuid,uuid,integer,jsonb,boolean), public.gg_catalog(uuid),
  public.gg_read_submissions(uuid,boolean,uuid), public.gg_moderate(uuid,uuid,text,text,boolean)
  to service_role;
