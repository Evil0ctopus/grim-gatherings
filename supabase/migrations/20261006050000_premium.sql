-- Only the verified Edge service may create/settle purchases. Browser roles
-- cannot grant entitlements or read another buyer's payment records.
create table public.gg_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.gg_profiles(id),
  bundle text not null default 'shadow-societies-v1' check(bundle='shadow-societies-v1'),
  environment text not null check(environment in ('sandbox','live')),
  amount numeric(10,2) not null check(amount>0),
  currency text not null check(currency='USD'),
  status text not null default 'created' check(status in ('created','pending','paid','refunded','reversed','denied','disputed')),
  paypal_order_id text unique,
  capture_id text unique,
  terms_version text not null,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gg_purchase_owner on public.gg_purchases(user_id,environment,created_at desc);
create table public.gg_payment_events (
  event_id text primary key,
  purchase_id uuid not null references public.gg_purchases(id),
  status text not null,
  created_at timestamptz not null default now()
);
alter table public.gg_purchases enable row level security;
alter table public.gg_payment_events enable row level security;
revoke all on public.gg_purchases, public.gg_payment_events from public, anon, authenticated;
grant all on public.gg_purchases, public.gg_payment_events to service_role;

create function public.gg_purchases(p_user uuid, p_environment text)
returns jsonb language sql security definer set search_path='' as $$
  select jsonb_build_object(
    'owned', exists(select 1 from public.gg_purchases where user_id=p_user and environment=p_environment and status='paid'),
    'orders', coalesce((select jsonb_agg(jsonb_build_object('id',id,'orderId',paypal_order_id,'status',status,
      'amount',amount::text,'currency',currency,'createdAt',created_at,'environment',environment) order by created_at desc)
      from public.gg_purchases where user_id=p_user and environment=p_environment), '[]'::jsonb));
$$;

create function public.gg_payment_begin(p_user uuid,p_environment text,p_amount numeric,p_currency text,p_terms text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare purchase public.gg_purchases;
begin
  perform public.gg_throttle(p_user);
  -- Serialize checkout attempts and reuse an unfinished order for retries.
  perform 1 from public.gg_profiles where id=p_user for update;
  if not found then raise exception using errcode='P0401',message='Log in before buying.'; end if;
  select * into purchase from public.gg_purchases where user_id=p_user and environment=p_environment and status='paid' limit 1;
  if found then return to_jsonb(purchase)||jsonb_build_object('amount',to_char(purchase.amount,'FM99999990.00')); end if;
  select * into purchase from public.gg_purchases where user_id=p_user and environment=p_environment
    and status in ('created','pending') and amount=p_amount and currency=p_currency and terms_version=p_terms
    and (status='pending' or created_at>now()-interval '3 hours') order by created_at desc limit 1;
  if not found then
    insert into public.gg_purchases(user_id,environment,amount,currency,terms_version)
      values(p_user,p_environment,p_amount,p_currency,p_terms) returning * into purchase;
  end if;
  return to_jsonb(purchase)||jsonb_build_object('amount',to_char(purchase.amount,'FM99999990.00'));
end; $$;

create function public.gg_payment_attach(p_user uuid,p_id uuid,p_paypal text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare purchase public.gg_purchases;
begin
  select * into purchase from public.gg_purchases where id=p_id and user_id=p_user for update;
  if not found then raise exception using errcode='P0404',message='Purchase not found in your account.'; end if;
  if purchase.paypal_order_id is not null and purchase.paypal_order_id<>p_paypal then
    raise exception using errcode='P0409',message='Payment reference changed. Contact support before paying.'; end if;
  update public.gg_purchases set paypal_order_id=p_paypal,updated_at=now() where id=p_id;
  return jsonb_build_object('id',p_id);
end; $$;

create function public.gg_payment_order(p_user uuid,p_paypal text,p_environment text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare purchase public.gg_purchases;
begin
  perform public.gg_throttle(p_user);
  select * into purchase from public.gg_purchases where user_id=p_user and paypal_order_id=p_paypal and environment=p_environment;
  if not found then raise exception using errcode='P0404',message='Payment not found in this account. Log in to the account used at checkout.'; end if;
  return to_jsonb(purchase)||jsonb_build_object('amount',to_char(purchase.amount,'FM99999990.00'));
end; $$;

create function public.gg_payment_lookup(p_paypal text,p_environment text)
returns jsonb language sql security definer set search_path='' as $$
  select to_jsonb(p)||jsonb_build_object('amount',to_char(p.amount,'FM99999990.00')) from public.gg_purchases p where paypal_order_id=p_paypal and environment=p_environment;
$$;

create function public.gg_payment_settle(p_id uuid,p_capture text,p_status text,p_event text,p_environment text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare purchase public.gg_purchases; previous uuid;
begin
  select * into purchase from public.gg_purchases where id=p_id and environment=p_environment for update;
  if not found then raise exception using errcode='P0404',message='Purchase not found.'; end if;
  if p_status is null or p_status not in ('paid','pending','refunded','reversed','denied','disputed') or p_capture is null then
    raise exception using errcode='P0400',message='Invalid verified payment status.'; end if;
  if purchase.capture_id is not null and purchase.capture_id<>p_capture then
    raise exception using errcode='P0409',message='A different capture is already attached.'; end if;
  if p_event is not null then
    insert into public.gg_payment_events(event_id,purchase_id,status) values(p_event,p_id,p_status) on conflict(event_id) do nothing;
    select purchase_id into previous from public.gg_payment_events where event_id=p_event;
    if previous<>p_id then raise exception using errcode='P0409',message='Webhook reference belongs to another purchase.'; end if;
  end if;
  -- A late completed event must not undo a refund/reversal, and a pending event
  -- must not undo a completed capture. Access is derived from settled rows.
  if purchase.status not in ('refunded','reversed','denied') and not(purchase.status='paid' and p_status='pending')
    and not(purchase.status='disputed' and p_status in ('pending','paid') and coalesce(p_event,'') not like 'dispute-won-%') then
    update public.gg_purchases set status=p_status,capture_id=p_capture,updated_at=now() where id=p_id returning * into purchase;
  end if;
  return jsonb_build_object('id',p_id,'status',purchase.status);
end; $$;

revoke all on function public.gg_purchases(uuid,text),public.gg_payment_begin(uuid,text,numeric,text,text),
  public.gg_payment_attach(uuid,uuid,text),public.gg_payment_order(uuid,text,text),public.gg_payment_lookup(text,text),
  public.gg_payment_settle(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.gg_purchases(uuid,text),public.gg_payment_begin(uuid,text,numeric,text,text),
  public.gg_payment_attach(uuid,uuid,text),public.gg_payment_order(uuid,text,text),public.gg_payment_lookup(text,text),
  public.gg_payment_settle(uuid,text,text,text,text) to service_role;

create function public.gg_payment_admin(p_user uuid,p_id uuid,p_environment text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare purchase public.gg_purchases; result jsonb;
begin
  if not exists(select 1 from public.gg_profiles where id=p_user and role='admin') then
    raise exception using errcode='P0403',message='Only the administrator can manage payments.'; end if;
  if p_id is not null then
    select * into purchase from public.gg_purchases where id=p_id and environment=p_environment;
    if not found then raise exception using errcode='P0404',message='Purchase not found.'; end if;
    return to_jsonb(purchase)||jsonb_build_object('amount',to_char(purchase.amount,'FM99999990.00'));
  end if;
  select coalesce(jsonb_agg(to_jsonb(p)),'[]'::jsonb) into result from (
    select o.id,o.user_id,o.paypal_order_id,o.status,to_char(o.amount,'FM99999990.00') as amount,
      o.currency,o.created_at,u.email from public.gg_purchases o join public.gg_profiles u on u.id=o.user_id
      where o.environment=p_environment order by o.created_at desc limit 50
  ) p;
  return jsonb_build_object('orders',result);
end; $$;
revoke all on function public.gg_payment_admin(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.gg_payment_admin(uuid,uuid,text) to service_role;
