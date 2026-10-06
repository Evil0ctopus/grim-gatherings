create table public.gg_premium_rooms (
  code text primary key check(code ~ '^[A-Z2-9]{8}$'),
  owner_id uuid not null references public.gg_profiles(id),
  environment text not null check(environment in ('sandbox','live')),
  revision integer not null default 1,
  data jsonb not null,
  expires_at timestamptz not null default now()+interval '24 hours'
);
create index gg_premium_room_owner on public.gg_premium_rooms(owner_id,environment);
alter table public.gg_premium_rooms enable row level security;
revoke all on public.gg_premium_rooms from public,anon,authenticated;
grant all on public.gg_premium_rooms to service_role;

create function public.gg_room_access(p_code text,p_environment text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare room public.gg_premium_rooms;
begin
  select * into room from public.gg_premium_rooms where code=p_code and environment=p_environment and expires_at>now();
  if not found then raise exception using errcode='P0404',message='Room not found or expired. Check the code with your host.'; end if;
  if not exists(select 1 from public.gg_purchases where user_id=room.owner_id and environment=p_environment and status='paid') then
    raise exception using errcode='P0403',message='The host no longer has active bundle access. Contact the host.'; end if;
  return to_jsonb(room);
end; $$;

create function public.gg_room_create(p_code text,p_user uuid,p_environment text,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
  perform public.gg_throttle(p_user);
  perform 1 from public.gg_profiles where id=p_user for update;
  if not exists(select 1 from public.gg_purchases where user_id=p_user and environment=p_environment and status='paid') then
    raise exception using errcode='P0403',message='Buy the bundle with this account before hosting.'; end if;
  delete from public.gg_premium_rooms where expires_at<=now();
  if (select count(*) from public.gg_premium_rooms where owner_id=p_user and environment=p_environment and data->>'phase'<>'closed')>=3 then
    raise exception using errcode='P0409',message='Close an existing room before creating another (three active rooms maximum).'; end if;
  insert into public.gg_premium_rooms(code,owner_id,environment,data) values(p_code,p_user,p_environment,p_data);
  return public.gg_room_access(p_code,p_environment);
end; $$;

create function public.gg_room_save(p_code text,p_environment text,p_revision integer,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
  perform public.gg_room_access(p_code,p_environment);
  update public.gg_premium_rooms set data=p_data,revision=revision+1
    where code=p_code and environment=p_environment and revision=p_revision and expires_at>now()
    returning to_jsonb(gg_premium_rooms) into result;
  return result;
end; $$;

create function public.gg_room_list(p_user uuid,p_environment text)
returns jsonb language sql security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object('code',code,'gameId',data->>'gameId',
    'phase',data->>'phase','expiresAt',expires_at) order by expires_at desc),'[]'::jsonb)
    from public.gg_premium_rooms where owner_id=p_user and environment=p_environment and expires_at>now();
$$;

revoke all on function public.gg_room_access(text,text),public.gg_room_create(text,uuid,text,jsonb),
  public.gg_room_save(text,text,integer,jsonb),public.gg_room_list(uuid,text) from public,anon,authenticated;
grant execute on function public.gg_room_access(text,text),public.gg_room_create(text,uuid,text,jsonb),
  public.gg_room_save(text,text,integer,jsonb),public.gg_room_list(uuid,text) to service_role;
