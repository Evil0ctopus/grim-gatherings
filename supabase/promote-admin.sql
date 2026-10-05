-- Run in your project's SQL Editor after creating/verifying your game account.
-- Replace only the email below. No passwords, JWTs or service keys belong here.
-- The Edge profile may not exist until first login, so this also creates it.
do $$
declare account record; owner_email text := 'REPLACE_WITH_YOUR_EMAIL';
begin
  if owner_email = 'REPLACE_WITH_YOUR_EMAIL' then
    raise exception 'Replace REPLACE_WITH_YOUR_EMAIL with the email of your verified game account.';
  end if;
  select id,email,raw_user_meta_data,email_confirmed_at into account
    from auth.users where lower(email)=lower(owner_email);
  if not found or account.email_confirmed_at is null then
    raise exception 'Create and verify this game account before granting administrator access.';
  end if;
  insert into public.gg_profiles(id,email,name,role)
    values(account.id,account.email,left(coalesce(nullif(trim(account.raw_user_meta_data->>'name'),''),'Site owner'),80),'admin')
    on conflict(id) do update set role='admin';
end $$;
