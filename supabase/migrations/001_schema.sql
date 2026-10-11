-- ACME Retail schema for Supabase. Payment status and fulfillment status are independent.
-- Tax and shipping figures are illustrative. Simulated payments never move real money.
-- Keep compute_totals in sync with src/services/pricing.ts.

create extension if not exists pgcrypto;

create type public.user_role as enum ('customer', 'catalog', 'warehouse', 'finance', 'administrator');
create type public.product_status as enum ('draft', 'active', 'archived');
create type public.payment_status as enum ('unpaid', 'pending', 'requires_authentication', 'approved', 'declined', 'timed_out', 'partially_refunded', 'refunded');
create type public.fulfillment_status as enum ('unfulfilled', 'reserved', 'picking', 'shipped', 'delivered', 'cancelled', 'return_requested', 'partially_returned', 'returned');
create type public.payment_provider as enum ('simulated', 'stripe');
create type public.shipment_status as enum ('label_created', 'in_transit', 'out_for_delivery', 'delivered', 'exception');
create type public.return_status as enum ('requested', 'approved', 'received', 'rejected', 'refunded');
create type public.refund_status as enum ('pending', 'completed', 'failed');
create type public.refund_kind as enum ('full', 'partial');
create type public.coupon_kind as enum ('percent', 'fixed', 'free_shipping');
create type public.reservation_purpose as enum ('checkout', 'fulfillment');

create sequence public.order_number_seq start 10601;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.user_role not null default 'customer',
  phone text,
  avatar_path text,
  marketing_opt_in boolean not null default false,
  order_emails boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  line1 text not null,
  line2 text not null default '',
  city text not null,
  region text not null,
  postal_code text not null,
  country text not null default 'United States',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  blurb text not null default '',
  sort_order integer not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  brand text not null default '',
  category_id uuid references public.categories (id),
  status public.product_status not null default 'active',
  base_price_cents integer not null check (base_price_cents >= 0),
  compare_at_cents integer,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text,
  public_path text not null,
  alt text,
  sort_order integer not null default 0
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  name text not null,
  options jsonb not null default '{}'::jsonb,
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true
);

create table public.inventory (
  variant_id uuid primary key references public.product_variants (id) on delete cascade,
  on_hand integer not null default 0 check (on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  location text not null default 'A-01',
  reorder_point integer not null default 4,
  constraint inventory_reserved_within_on_hand check (reserved <= on_hand)
);

create table public.coupons (
  code text primary key,
  kind public.coupon_kind not null,
  value integer not null default 0,
  min_subtotal_cents integer not null default 0,
  label text not null,
  active boolean not null default true,
  expires_at timestamptz
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  coupon_code text,
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id),
  quantity integer not null check (quantity between 1 and 10),
  unique (cart_id, variant_id)
);

create table public.wishlists (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  user_id uuid references public.profiles (id),
  email text not null,
  payment_status public.payment_status not null default 'pending',
  fulfillment_status public.fulfillment_status not null default 'unfulfilled',
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  shipping_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'USD',
  coupon_code text,
  shipping_method text not null,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  placed_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid references public.product_variants (id),
  sku text not null,
  name text not null,
  variant_name text not null,
  options jsonb not null default '{}'::jsonb,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null,
  line_total_cents integer not null
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider public.payment_provider not null default 'simulated',
  status public.payment_status not null,
  amount_cents integer not null,
  scenario text,
  external_id text,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id),
  quantity integer not null check (quantity > 0),
  purpose public.reservation_purpose not null default 'checkout',
  expires_at timestamptz,
  released_at timestamptz
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  carrier text not null,
  tracking_number text not null unique,
  status public.shipment_status not null default 'label_created',
  shipped_at timestamptz,
  delivered_at timestamptz
);

create table public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  status public.shipment_status not null,
  message text not null,
  occurred_at timestamptz not null default now()
);

create table public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid references public.profiles (id),
  status public.return_status not null default 'requested',
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references public.returns (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id),
  quantity integer not null check (quantity > 0)
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  return_id uuid references public.returns (id),
  amount_cents integer not null check (amount_cents > 0),
  kind public.refund_kind not null,
  status public.refund_status not null default 'pending',
  reason text not null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.scenarios (
  key text primary key,
  name text not null,
  description text not null,
  default_outcome text not null,
  delay_shipments boolean not null default false,
  force_timeout boolean not null default false,
  open_returns boolean not null default false,
  suggest_refunds boolean not null default false
);

create table public.simulation_state (
  id integer primary key default 1 check (id = 1),
  scenario_key text not null references public.scenarios (key),
  simulated_now timestamptz not null default now(),
  ticks integer not null default 0
);

create table public.domain_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  event_type text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  actor uuid,
  created_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, placed_at desc);
create index orders_payment_idx on public.orders (payment_status);
create index orders_fulfillment_idx on public.orders (fulfillment_status);
create index events_created_idx on public.domain_events (created_at desc);
create index products_category_idx on public.products (category_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();
create trigger carts_touch before update on public.carts
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'guest'), '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_role(roles public.user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = any (roles)
$$;

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') <> 'service_role'
     and not public.is_role(array['administrator']::public.user_role[]) then
    raise exception 'You cannot change your role.';
  end if;
  return new;
end;
$$;

create trigger profiles_role_guard before update on public.profiles
for each row execute function public.prevent_role_change();

create or replace function public.log_event(p_type text, p_message text, p_order_id uuid default null, p_payload jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.domain_events (order_id, event_type, message, payload, actor)
  values (p_order_id, p_type, p_message, coalesce(p_payload, '{}'::jsonb), auth.uid());
end;
$$;

create or replace function public.compute_totals(p_subtotal integer, p_coupon text, p_shipping_method text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_code text := nullif(upper(btrim(coalesce(p_coupon, ''))), '');
  v_coupon public.coupons%rowtype;
  v_discount integer := 0;
  v_shipping integer := 0;
  v_taxable integer;
  v_tax integer;
  v_free boolean := false;
begin
  if p_shipping_method not in ('standard', 'express') then
    raise exception 'Choose a shipping method.';
  end if;
  if v_code is not null then
    select * into v_coupon from public.coupons
    where code = v_code and active and (expires_at is null or expires_at > now());
    if not found then
      raise exception 'That coupon code is not active.';
    end if;
    if p_subtotal < v_coupon.min_subtotal_cents then
      raise exception 'This coupon needs a higher subtotal.';
    end if;
    if v_coupon.kind = 'percent' then
      v_discount := (p_subtotal * v_coupon.value) / 100;
    elsif v_coupon.kind = 'fixed' then
      v_discount := least(v_coupon.value, p_subtotal);
    elsif v_coupon.kind = 'free_shipping' then
      v_free := true;
    end if;
  end if;

  v_taxable := p_subtotal - v_discount;
  if p_shipping_method = 'express' then
    v_shipping := 1895;
  elsif v_free or v_taxable >= 7500 then
    v_shipping := 0;
  else
    v_shipping := 895;
  end if;
  v_tax := round(v_taxable * 0.0825)::integer;

  return jsonb_build_object(
    'subtotalCents', p_subtotal,
    'discountCents', v_discount,
    'shippingCents', v_shipping,
    'taxCents', v_tax,
    'totalCents', v_taxable + v_shipping + v_tax,
    'couponCode', v_code,
    'shippingMethod', p_shipping_method,
    'freeShippingApplied', v_shipping = 0
  );
end;
$$;

create or replace function public.release_expired_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_count integer := 0;
begin
  for r in
    select sr.id, sr.order_id, sr.variant_id, sr.quantity
    from public.stock_reservations sr
    join public.orders o on o.id = sr.order_id
    where sr.released_at is null
      and sr.purpose = 'checkout'
      and sr.expires_at is not null
      and sr.expires_at < now()
      and o.payment_status in ('pending', 'requires_authentication', 'unpaid')
    for update of sr
  loop
    update public.stock_reservations set released_at = now() where id = r.id;
    update public.inventory set reserved = greatest(0, reserved - r.quantity) where variant_id = r.variant_id;
    update public.orders
      set payment_status = 'timed_out', fulfillment_status = 'unfulfilled'
      where id = r.order_id;
    insert into public.payments (order_id, provider, status, amount_cents, scenario, message)
    select r.order_id, 'simulated', 'timed_out', total_cents, 'timeout',
      'The reservation expired before payment finished. No charge was made.'
    from public.orders where id = r.order_id;
    perform public.log_event('reservation.expired', 'Checkout reservation expired and stock was released.', r.order_id);
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.place_order(
  p_items jsonb,
  p_email text,
  p_shipping_address jsonb,
  p_billing_address jsonb,
  p_shipping_method text,
  p_coupon_code text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid := gen_random_uuid();
  v_number text;
  v_item jsonb;
  v_variant record;
  v_qty integer;
  v_subtotal integer := 0;
  v_totals jsonb;
  v_line integer;
begin
  if v_user is null then
    raise exception 'Sign in to check out.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;
  if coalesce(p_shipping_address->>'line1', '') = '' or coalesce(p_shipping_address->>'city', '') = ''
     or coalesce(p_shipping_address->>'region', '') = '' or coalesce(p_shipping_address->>'postalCode', '') = '' then
    raise exception 'Enter a complete shipping address.';
  end if;

  perform public.release_expired_reservations();
  v_number := 'AC' || nextval('public.order_number_seq')::text;

  insert into public.orders (
    id, number, user_id, email, payment_status, fulfillment_status,
    subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents,
    coupon_code, shipping_method, shipping_address, billing_address
  ) values (
    v_order_id, v_number, v_user, coalesce(nullif(p_email, ''), (select email from public.profiles where id = v_user)),
    'pending', 'reserved', 0, 0, 0, 0, 0, null, p_shipping_method, p_shipping_address, coalesce(p_billing_address, p_shipping_address)
  );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 10 then
      raise exception 'Quantity must be between 1 and 10.';
    end if;

    select v.id, v.sku, v.name as variant_name, v.options, v.price_cents, v.active,
           p.name as product_name, p.status as product_status, i.on_hand, i.reserved
      into v_variant
    from public.product_variants v
    join public.products p on p.id = v.product_id
    join public.inventory i on i.variant_id = v.id
    where v.id = (v_item->>'variantId')::uuid
    for update of i;

    if not found or not v_variant.active or v_variant.product_status <> 'active' then
      raise exception 'A product in your cart is no longer available.';
    end if;
    if v_variant.on_hand - v_variant.reserved < v_qty then
      raise exception 'Not enough stock for %.', v_variant.product_name;
    end if;

    v_line := v_variant.price_cents * v_qty;
    v_subtotal := v_subtotal + v_line;
    insert into public.order_items (order_id, variant_id, sku, name, variant_name, options, quantity, unit_price_cents, line_total_cents)
    values (v_order_id, v_variant.id, v_variant.sku, v_variant.product_name, v_variant.variant_name, v_variant.options, v_qty, v_variant.price_cents, v_line);

    update public.inventory set reserved = reserved + v_qty where variant_id = v_variant.id;
    insert into public.stock_reservations (order_id, variant_id, quantity, purpose, expires_at)
    values (v_order_id, v_variant.id, v_qty, 'checkout', now() + interval '20 minutes');
  end loop;

  v_totals := public.compute_totals(v_subtotal, p_coupon_code, p_shipping_method);
  update public.orders set
    subtotal_cents = (v_totals->>'subtotalCents')::integer,
    discount_cents = (v_totals->>'discountCents')::integer,
    shipping_cents = (v_totals->>'shippingCents')::integer,
    tax_cents = (v_totals->>'taxCents')::integer,
    total_cents = (v_totals->>'totalCents')::integer,
    coupon_code = v_totals->>'couponCode'
  where id = v_order_id;

  perform public.log_event('order.placed', 'Order placed and stock reserved at the current price.', v_order_id, v_totals);
  return jsonb_build_object('orderId', v_order_id, 'number', v_number) || v_totals;
end;
$$;

create or replace function public.settle_payment(
  p_order_id uuid,
  p_outcome text,
  p_provider text default 'simulated',
  p_external_id text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_status public.payment_status;
  v_message text;
  v_provider public.payment_provider;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    if auth.uid() is null then
      raise exception 'Sign in to continue.';
    end if;
  end if;
  if p_outcome not in ('approved', 'declined', 'authentication_required', 'timeout') then
    raise exception 'Choose a payment outcome.';
  end if;
  if p_provider = 'stripe' and coalesce(auth.role(), '') <> 'service_role' and p_outcome = 'approved' then
    raise exception 'Stripe test payments are confirmed from the Checkout session, not from the browser.';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found.';
  end if;
  if coalesce(auth.role(), '') <> 'service_role'
     and v_order.user_id <> auth.uid()
     and not public.is_role(array['finance', 'administrator']::public.user_role[]) then
    raise exception 'You cannot update this payment.';
  end if;

  if v_order.payment_status = 'requires_authentication' and p_outcome = 'approved' then
    null;
  elsif v_order.payment_status <> 'pending' then
    return jsonb_build_object('orderId', v_order.id, 'number', v_order.number, 'paymentStatus', v_order.payment_status, 'fulfillmentStatus', v_order.fulfillment_status, 'alreadySettled', true);
  end if;

  v_provider := case when p_provider = 'stripe' then 'stripe'::public.payment_provider else 'simulated'::public.payment_provider end;

  if p_outcome = 'approved' then
    v_status := 'approved';
    v_message := case when v_order.payment_status = 'requires_authentication'
      then 'Simulated authentication completed. Payment approved. No real money moved.'
      else 'Simulated payment approved. The purchase price is saved on this order. No real money moved.' end;
    update public.orders set payment_status = 'approved', fulfillment_status = 'reserved' where id = v_order.id;
    update public.stock_reservations
      set purpose = 'fulfillment', expires_at = null
      where order_id = v_order.id and released_at is null;
  elsif p_outcome = 'declined' then
    v_status := 'declined';
    v_message := 'The simulated card was declined. No charge was made and reserved stock was released.';
    update public.orders set payment_status = 'declined', fulfillment_status = 'unfulfilled' where id = v_order.id;
    perform public.release_order_stock(v_order.id);
  elsif p_outcome = 'authentication_required' then
    v_status := 'requires_authentication';
    v_message := 'The simulated bank asked for an extra authentication step. No charge has been made.';
    update public.orders set payment_status = 'requires_authentication' where id = v_order.id;
    update public.stock_reservations
      set expires_at = now() + interval '30 minutes'
      where order_id = v_order.id and released_at is null and purpose = 'checkout';
  else
    v_status := 'timed_out';
    v_message := 'The simulated gateway timed out. No charge was made and reserved stock was released.';
    update public.orders set payment_status = 'timed_out', fulfillment_status = 'unfulfilled' where id = v_order.id;
    perform public.release_order_stock(v_order.id);
  end if;

  insert into public.payments (order_id, provider, status, amount_cents, scenario, external_id, message)
  values (v_order.id, v_provider, v_status, v_order.total_cents, p_outcome, p_external_id, v_message);
  perform public.log_event('payment.settled', v_message, v_order.id, jsonb_build_object('outcome', p_outcome, 'provider', p_provider));

  return jsonb_build_object(
    'orderId', v_order.id,
    'number', v_order.number,
    'paymentStatus', v_status,
    'fulfillmentStatus', (select fulfillment_status from public.orders where id = v_order.id),
    'message', v_message,
    'alreadySettled', false
  );
end;
$$;

create or replace function public.release_order_stock(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    select id, variant_id, quantity from public.stock_reservations
    where order_id = p_order_id and released_at is null
    for update
  loop
    update public.inventory set reserved = greatest(0, reserved - r.quantity) where variant_id = r.variant_id;
    update public.stock_reservations set released_at = now() where id = r.id;
  end loop;
end;
$$;

create or replace function public.cancel_order(p_order_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_refunded integer;
  v_remaining integer;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;
  if coalesce(auth.role(), '') <> 'service_role'
     and v_order.user_id <> auth.uid()
     and not public.is_role(array['administrator', 'warehouse']::public.user_role[]) then
    raise exception 'You cannot cancel this order.';
  end if;
  if v_order.fulfillment_status in ('shipped', 'delivered', 'return_requested', 'partially_returned', 'returned') then
    raise exception 'Shipped orders cannot be cancelled. Start a return instead.';
  end if;
  if v_order.fulfillment_status = 'cancelled' then
    return jsonb_build_object('orderId', v_order.id, 'fulfillmentStatus', 'cancelled');
  end if;

  perform public.release_order_stock(v_order.id);
  if v_order.payment_status in ('approved', 'partially_refunded') then
    select coalesce(sum(amount_cents), 0) into v_refunded from public.refunds where order_id = v_order.id and status = 'completed';
    v_remaining := v_order.total_cents - v_refunded;
    if v_remaining > 0 then
      insert into public.refunds (order_id, amount_cents, kind, status, reason, created_by, completed_at)
      values (v_order.id, v_remaining, 'full', 'completed', coalesce(nullif(p_reason, ''), 'Cancelled before shipment.'), auth.uid(), now());
    end if;
    update public.orders set payment_status = 'refunded', fulfillment_status = 'cancelled' where id = v_order.id;
  else
    update public.orders set payment_status = 'declined', fulfillment_status = 'cancelled' where id = v_order.id;
    insert into public.payments (order_id, provider, status, amount_cents, scenario, message)
    values (v_order.id, 'simulated', 'declined', v_order.total_cents, 'declined', 'Order cancelled before payment completed. No charge was made.');
  end if;
  perform public.log_event('order.cancelled', coalesce(nullif(p_reason, ''), 'Order cancelled.'), v_order.id);
  return jsonb_build_object('orderId', v_order.id, 'number', v_order.number);
end;
$$;

create or replace function public.mark_picking(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_role(array['warehouse', 'administrator']::public.user_role[]) then
    raise exception 'Warehouse access is required.';
  end if;
  update public.orders set fulfillment_status = 'picking'
  where id = p_order_id and payment_status in ('approved', 'partially_refunded') and fulfillment_status = 'reserved';
  if not found then
    raise exception 'Only paid, reserved orders can move to picking.';
  end if;
  perform public.log_event('fulfillment.picking', 'Warehouse started picking this order.', p_order_id);
  return jsonb_build_object('orderId', p_order_id, 'fulfillmentStatus', 'picking');
end;
$$;

create or replace function public.create_shipment(p_order_id uuid, p_carrier text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  r record;
  v_shipment uuid := gen_random_uuid();
  v_tracking text;
begin
  if not public.is_role(array['warehouse', 'administrator']::public.user_role[]) then
    raise exception 'Warehouse access is required.';
  end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;
  if v_order.payment_status not in ('approved', 'partially_refunded') then
    raise exception 'Ship only orders with an approved payment.';
  end if;
  if v_order.fulfillment_status not in ('reserved', 'picking') then
    raise exception 'This order is not ready to ship.';
  end if;
  if exists (select 1 from public.shipments where order_id = p_order_id) then
    raise exception 'A shipment already exists for this order.';
  end if;

  for r in
    select id, variant_id, quantity from public.stock_reservations
    where order_id = p_order_id and released_at is null
    for update
  loop
    update public.inventory
      set on_hand = on_hand - r.quantity, reserved = reserved - r.quantity
      where variant_id = r.variant_id;
    update public.stock_reservations set released_at = now() where id = r.id;
  end loop;

  v_tracking := 'ACME' || floor(random() * 900000 + 100000)::text;
  insert into public.shipments (id, order_id, carrier, tracking_number, status, shipped_at)
  values (v_shipment, p_order_id, coalesce(nullif(p_carrier, ''), 'Northline Parcel'), v_tracking, 'label_created', now());
  insert into public.shipment_events (shipment_id, status, message)
  values (v_shipment, 'label_created', 'Shipping label created.');
  update public.orders set fulfillment_status = 'shipped' where id = p_order_id;
  perform public.log_event('fulfillment.shipped', 'Shipment created. Payment status was left unchanged.', p_order_id, jsonb_build_object('trackingNumber', v_tracking));
  return jsonb_build_object('shipmentId', v_shipment, 'trackingNumber', v_tracking);
end;
$$;

create or replace function public.advance_shipment(p_shipment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shipment public.shipments%rowtype;
  v_next public.shipment_status;
  v_message text;
begin
  if not public.is_role(array['warehouse', 'administrator']::public.user_role[]) and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Warehouse access is required.';
  end if;
  select * into v_shipment from public.shipments where id = p_shipment_id for update;
  if not found then raise exception 'Shipment not found.'; end if;
  v_next := case v_shipment.status
    when 'label_created' then 'in_transit'::public.shipment_status
    when 'in_transit' then 'out_for_delivery'::public.shipment_status
    when 'out_for_delivery' then 'delivered'::public.shipment_status
    else null
  end;
  if v_next is null then
    return jsonb_build_object('status', v_shipment.status, 'unchanged', true);
  end if;
  v_message := case v_next
    when 'in_transit' then 'Parcel accepted by the carrier.'
    when 'out_for_delivery' then 'Out for delivery.'
    else 'Delivered. Signed for at the door.'
  end;
  update public.shipments
    set status = v_next, delivered_at = case when v_next = 'delivered' then now() else delivered_at end
    where id = p_shipment_id;
  insert into public.shipment_events (shipment_id, status, message) values (p_shipment_id, v_next, v_message);
  if v_next = 'delivered' then
    update public.orders set fulfillment_status = 'delivered'
    where id = v_shipment.order_id and fulfillment_status = 'shipped';
  end if;
  perform public.log_event('fulfillment.advanced', v_message, v_shipment.order_id, jsonb_build_object('status', v_next));
  return jsonb_build_object('status', v_next, 'message', v_message);
end;
$$;

create or replace function public.request_return(p_order_id uuid, p_items jsonb, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_return uuid := gen_random_uuid();
  v_item jsonb;
  v_line public.order_items%rowtype;
  v_already integer;
  v_qty integer;
begin
  if coalesce(p_reason, '') = '' then
    raise exception 'Tell us why you are returning this order.';
  end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;
  if v_order.user_id <> auth.uid() and not public.is_role(array['warehouse', 'administrator']::public.user_role[]) then
    raise exception 'You cannot return this order.';
  end if;
  if v_order.fulfillment_status not in ('delivered', 'partially_returned', 'return_requested') then
    raise exception 'Returns open after delivery.';
  end if;
  if v_order.payment_status not in ('approved', 'partially_refunded', 'refunded') then
    raise exception 'This payment is not eligible for a return.';
  end if;

  insert into public.returns (id, order_id, user_id, status, reason)
  values (v_return, p_order_id, auth.uid(), 'requested', p_reason);

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::integer;
    select * into v_line from public.order_items where id = (v_item->>'orderItemId')::uuid and order_id = p_order_id;
    if not found then raise exception 'That item is not on the order.'; end if;
    select coalesce(sum(ri.quantity), 0) into v_already
    from public.return_items ri
    join public.returns r on r.id = ri.return_id
    where ri.order_item_id = v_line.id and r.status <> 'rejected';
    if v_qty < 1 or v_already + v_qty > v_line.quantity then
      raise exception 'Return quantity is higher than what can still be sent back.';
    end if;
    insert into public.return_items (return_id, order_item_id, quantity) values (v_return, v_line.id, v_qty);
  end loop;

  update public.orders set fulfillment_status = 'return_requested' where id = p_order_id and fulfillment_status = 'delivered';
  perform public.log_event('return.requested', 'Return requested. Payment status was not changed.', p_order_id);
  return jsonb_build_object('returnId', v_return);
end;
$$;

create or replace function public.review_return(p_return_id uuid, p_decision text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_return public.returns%rowtype;
  r record;
  v_open integer;
begin
  if not public.is_role(array['warehouse', 'administrator']::public.user_role[]) then
    raise exception 'Warehouse access is required.';
  end if;
  if p_decision not in ('approved', 'rejected', 'received') then
    raise exception 'Choose a return decision.';
  end if;
  select * into v_return from public.returns where id = p_return_id for update;
  if not found then raise exception 'Return not found.'; end if;

  if p_decision = 'received' then
    for r in
      select ri.quantity, oi.variant_id
      from public.return_items ri
      join public.order_items oi on oi.id = ri.order_item_id
      where ri.return_id = p_return_id
    loop
      update public.inventory set on_hand = on_hand + r.quantity where variant_id = r.variant_id;
    end loop;
    update public.returns set status = 'received' where id = p_return_id;
    select count(*) into v_open from public.returns where order_id = v_return.order_id and status in ('requested', 'approved');
    update public.orders
      set fulfillment_status = case when v_open = 0 then 'returned'::public.fulfillment_status else 'partially_returned'::public.fulfillment_status end
      where id = v_return.order_id;
  elsif p_decision = 'rejected' then
    update public.returns set status = 'rejected' where id = p_return_id;
    select count(*) into v_open from public.returns where order_id = v_return.order_id and status in ('requested', 'approved', 'received');
    if v_open = 0 then
      update public.orders set fulfillment_status = 'delivered' where id = v_return.order_id and fulfillment_status = 'return_requested';
    end if;
  else
    update public.returns set status = 'approved' where id = p_return_id;
  end if;

  perform public.log_event('return.reviewed', 'Return marked ' || p_decision || '.', v_return.order_id);
  return jsonb_build_object('returnId', p_return_id, 'status', p_decision);
end;
$$;

create or replace function public.issue_refund(
  p_order_id uuid,
  p_amount_cents integer,
  p_reason text,
  p_return_id uuid default null,
  p_refund_id uuid default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_refunded integer;
  v_remaining integer;
  v_amount integer;
  v_id uuid;
begin
  if not public.is_role(array['finance', 'administrator']::public.user_role[]) and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Finance access is required.';
  end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found.'; end if;
  if v_order.payment_status not in ('approved', 'partially_refunded') then
    raise exception 'Only approved payments can be refunded.';
  end if;
  select coalesce(sum(amount_cents), 0) into v_refunded
  from public.refunds where order_id = p_order_id and status = 'completed';
  v_remaining := v_order.total_cents - v_refunded;

  if p_refund_id is not null then
    select amount_cents into v_amount from public.refunds where id = p_refund_id and order_id = p_order_id and status = 'pending';
    if v_amount is null then raise exception 'Pending refund not found.'; end if;
    if v_amount > v_remaining then raise exception 'Refund is larger than the remaining captured amount.'; end if;
    update public.refunds set status = 'completed', completed_at = now(), created_by = coalesce(created_by, auth.uid()) where id = p_refund_id;
    v_id := p_refund_id;
    v_refunded := v_refunded + v_amount;
  else
    if p_amount_cents is null or p_amount_cents < 1 then
      raise exception 'Enter a refund amount.';
    end if;
    if p_amount_cents > v_remaining then
      raise exception 'Refund is larger than the remaining captured amount.';
    end if;
    if coalesce(p_reason, '') = '' then
      raise exception 'Enter a reason for the refund.';
    end if;
    v_id := gen_random_uuid();
    insert into public.refunds (id, order_id, return_id, amount_cents, kind, status, reason, created_by, completed_at)
    values (
      v_id, p_order_id, p_return_id, p_amount_cents,
      case when p_amount_cents = v_remaining then 'full'::public.refund_kind else 'partial'::public.refund_kind end,
      'completed', p_reason, auth.uid(), now()
    );
    v_refunded := v_refunded + p_amount_cents;
  end if;

  update public.orders
    set payment_status = case when v_refunded >= total_cents then 'refunded'::public.payment_status else 'partially_refunded'::public.payment_status end
    where id = p_order_id;
  perform public.log_event('refund.completed', 'Refund recorded. Fulfillment status was left unchanged.', p_order_id, jsonb_build_object('refundId', v_id));
  return jsonb_build_object('refundId', v_id, 'paymentStatus', (select payment_status from public.orders where id = p_order_id));
end;
$$;

create or replace function public.adjust_inventory(p_variant_id uuid, p_on_hand integer, p_location text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reserved integer;
begin
  if not public.is_role(array['warehouse', 'catalog', 'administrator']::public.user_role[]) then
    raise exception 'Inventory access is required.';
  end if;
  if p_on_hand < 0 then raise exception 'On-hand quantity cannot be negative.'; end if;
  select reserved into v_reserved from public.inventory where variant_id = p_variant_id for update;
  if not found then raise exception 'Inventory row not found.'; end if;
  if p_on_hand < v_reserved then
    raise exception 'On-hand quantity cannot drop below the reserved quantity.';
  end if;
  update public.inventory
    set on_hand = p_on_hand, location = coalesce(nullif(p_location, ''), location)
    where variant_id = p_variant_id;
  perform public.log_event('inventory.adjusted', 'On-hand quantity updated.', null, jsonb_build_object('variantId', p_variant_id, 'onHand', p_on_hand));
  return jsonb_build_object('variantId', p_variant_id, 'onHand', p_on_hand);
end;
$$;

create or replace function public.set_scenario(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  if not public.is_role(array['administrator']::public.user_role[]) then
    raise exception 'Administrator access is required.';
  end if;
  select name into v_name from public.scenarios where key = p_key;
  if not found then raise exception 'Unknown scenario.'; end if;
  update public.simulation_state set scenario_key = p_key where id = 1;
  perform public.log_event('simulation.scenario', 'Scenario set to ' || v_name || '.', null, jsonb_build_object('scenario', p_key));
  return jsonb_build_object('scenario', p_key, 'name', v_name);
end;
$$;

create or replace function public.advance_simulation()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state public.simulation_state%rowtype;
  v_scenario public.scenarios%rowtype;
  v_moved integer := 0;
  v_expired integer := 0;
  v_returns integer := 0;
  v_refunds integer := 0;
  r record;
  v_shipment uuid;
begin
  if not public.is_role(array['administrator']::public.user_role[]) then
    raise exception 'Administrator access is required.';
  end if;
  select * into v_state from public.simulation_state where id = 1 for update;
  select * into v_scenario from public.scenarios where key = v_state.scenario_key;

  update public.simulation_state
    set ticks = ticks + 1, simulated_now = simulated_now + interval '6 hours'
    where id = 1;

  if v_scenario.force_timeout then
    update public.stock_reservations sr
      set expires_at = now() - interval '1 minute'
      from public.orders o
      where sr.order_id = o.id
        and sr.released_at is null
        and sr.purpose = 'checkout'
        and o.payment_status in ('pending', 'requires_authentication');
  end if;
  v_expired := public.release_expired_reservations();

  if not v_scenario.delay_shipments then
    for r in select id from public.shipments where status <> 'delivered' order by shipped_at nulls last limit 12
    loop
      perform public.advance_shipment(r.id);
      v_moved := v_moved + 1;
    end loop;
  end if;

  if v_scenario.open_returns then
    for r in
      select o.id
      from public.orders o
      where o.fulfillment_status = 'delivered'
        and not exists (select 1 from public.returns ret where ret.order_id = o.id and ret.status <> 'rejected')
      order by o.placed_at desc
      limit 2
    loop
      insert into public.returns (order_id, user_id, status, reason)
      select r.id, o.user_id, 'requested', 'Opened by the return-surge scenario.'
      from public.orders o where o.id = r.id;
      insert into public.return_items (return_id, order_item_id, quantity)
      select ret.id, oi.id, 1
      from public.returns ret
      join lateral (
        select id from public.order_items where order_id = r.id order by line_total_cents desc limit 1
      ) oi on true
      where ret.order_id = r.id and ret.reason = 'Opened by the return-surge scenario.'
      order by ret.created_at desc
      limit 1;
      update public.orders set fulfillment_status = 'return_requested' where id = r.id;
      v_returns := v_returns + 1;
    end loop;
  end if;

  if v_scenario.suggest_refunds then
    for r in
      select o.id, least(1500, o.total_cents - coalesce((select sum(amount_cents) from public.refunds rf where rf.order_id = o.id and rf.status <> 'failed'), 0)) as amount
      from public.orders o
      where o.payment_status = 'approved'
        and o.total_cents > 2000
        and not exists (select 1 from public.refunds rf where rf.order_id = o.id and rf.status = 'pending')
      order by o.placed_at desc
      limit 2
    loop
      if r.amount > 0 then
        insert into public.refunds (order_id, amount_cents, kind, status, reason)
        values (r.id, r.amount, 'partial', 'pending', 'Suggested by the partial-refund scenario.');
        v_refunds := v_refunds + 1;
      end if;
    end loop;
  end if;

  perform public.log_event(
    'simulation.advanced',
    'Simulation advanced 6 hours.',
    null,
    jsonb_build_object('shipmentsMoved', v_moved, 'reservationsExpired', v_expired, 'returnsOpened', v_returns, 'refundsSuggested', v_refunds, 'scenario', v_scenario.key)
  );

  return jsonb_build_object(
    'scenario', v_scenario.key,
    'shipmentsMoved', v_moved,
    'reservationsExpired', v_expired,
    'returnsOpened', v_returns,
    'refundsSuggested', v_refunds,
    'ticks', v_state.ticks + 1
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.coupons enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.stock_reservations enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;
alter table public.returns enable row level security;
alter table public.return_items enable row level security;
alter table public.refunds enable row level security;
alter table public.scenarios enable row level security;
alter table public.simulation_state enable row level security;
alter table public.domain_events enable row level security;

create policy categories_read on public.categories for select to anon, authenticated using (true);
create policy products_read on public.products for select to anon, authenticated
  using (status = 'active' or public.is_role(array['catalog', 'administrator']::public.user_role[]));
create policy products_write on public.products for all to authenticated
  using (public.is_role(array['catalog', 'administrator']::public.user_role[]))
  with check (public.is_role(array['catalog', 'administrator']::public.user_role[]));
create policy images_read on public.product_images for select to anon, authenticated using (true);
create policy images_write on public.product_images for all to authenticated
  using (public.is_role(array['catalog', 'administrator']::public.user_role[]))
  with check (public.is_role(array['catalog', 'administrator']::public.user_role[]));
create policy variants_read on public.product_variants for select to anon, authenticated using (true);
create policy variants_write on public.product_variants for all to authenticated
  using (public.is_role(array['catalog', 'administrator']::public.user_role[]))
  with check (public.is_role(array['catalog', 'administrator']::public.user_role[]));
create policy inventory_read on public.inventory for select to anon, authenticated using (true);
create policy inventory_write on public.inventory for all to authenticated
  using (public.is_role(array['catalog', 'warehouse', 'administrator']::public.user_role[]))
  with check (public.is_role(array['catalog', 'warehouse', 'administrator']::public.user_role[]));
create policy coupons_staff on public.coupons for select to authenticated
  using (public.is_role(array['catalog', 'finance', 'administrator']::public.user_role[]));

create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_role(array['catalog', 'warehouse', 'finance', 'administrator']::public.user_role[]));
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_role(array['administrator']::public.user_role[]))
  with check (id = auth.uid() or public.is_role(array['administrator']::public.user_role[]));

create policy addresses_own on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy carts_own on public.carts for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cart_items_own on public.cart_items for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy wishlist_own on public.wishlists for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy orders_select on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_role(array['warehouse', 'finance', 'catalog', 'administrator']::public.user_role[]));
create policy order_items_select on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_role(array['warehouse', 'finance', 'catalog', 'administrator']::public.user_role[]))));
create policy payments_select on public.payments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_role(array['warehouse', 'finance', 'catalog', 'administrator']::public.user_role[]))));
create policy reservations_select on public.stock_reservations for select to authenticated
  using (public.is_role(array['warehouse', 'finance', 'administrator']::public.user_role[]) or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy shipments_select on public.shipments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_role(array['warehouse', 'finance', 'catalog', 'administrator']::public.user_role[]))));
create policy shipment_events_select on public.shipment_events for select to authenticated
  using (exists (
    select 1 from public.shipments s
    join public.orders o on o.id = s.order_id
    where s.id = shipment_id and (o.user_id = auth.uid() or public.is_role(array['warehouse', 'finance', 'catalog', 'administrator']::public.user_role[]))
  ));
create policy returns_select on public.returns for select to authenticated
  using (user_id = auth.uid() or public.is_role(array['warehouse', 'finance', 'administrator']::public.user_role[]) or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy return_items_select on public.return_items for select to authenticated
  using (exists (
    select 1 from public.returns r
    join public.orders o on o.id = r.order_id
    where r.id = return_id and (o.user_id = auth.uid() or public.is_role(array['warehouse', 'finance', 'administrator']::public.user_role[]))
  ));
create policy refunds_select on public.refunds for select to authenticated
  using (public.is_role(array['finance', 'administrator']::public.user_role[]) or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy scenarios_read on public.scenarios for select to anon, authenticated using (true);
create policy simulation_read on public.simulation_state for select to anon, authenticated using (true);
create policy events_select on public.domain_events for select to authenticated
  using (
    public.is_role(array['catalog', 'warehouse', 'finance', 'administrator']::public.user_role[])
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on public.addresses, public.carts, public.cart_items, public.wishlists, public.products, public.product_images, public.product_variants, public.inventory, public.profiles to authenticated;
grant usage, select on sequence public.order_number_seq to authenticated;

grant execute on function public.compute_totals(integer, text, text) to anon, authenticated;
grant execute on function public.place_order(jsonb, text, jsonb, jsonb, text, text) to authenticated;
grant execute on function public.settle_payment(uuid, text, text, text) to authenticated;
grant execute on function public.cancel_order(uuid, text) to authenticated;
grant execute on function public.mark_picking(uuid) to authenticated;
grant execute on function public.create_shipment(uuid, text) to authenticated;
grant execute on function public.advance_shipment(uuid) to authenticated;
grant execute on function public.request_return(uuid, jsonb, text) to authenticated;
grant execute on function public.review_return(uuid, text) to authenticated;
grant execute on function public.issue_refund(uuid, integer, text, uuid, uuid) to authenticated;
grant execute on function public.adjust_inventory(uuid, integer, text) to authenticated;
grant execute on function public.set_scenario(text) to authenticated;
grant execute on function public.advance_simulation() to authenticated;
grant execute on function public.release_expired_reservations() to authenticated;

insert into public.scenarios (key, name, description, default_outcome, delay_shipments, force_timeout, open_returns, suggest_refunds) values
  ('happy_path', 'Steady retail day', 'Payments approve and shipments move forward when you advance the clock.', 'approved', false, false, false, false),
  ('decline_spike', 'Declines spike', 'New checkouts default to a declined card. No charge is made.', 'declined', false, false, false, false),
  ('authentication', 'Bank authentication', 'New checkouts stop for a simulated authentication step.', 'authentication_required', false, false, false, false),
  ('gateway_timeout', 'Gateway timeout', 'Advancing the clock expires unpaid reservations and records a timeout.', 'timeout', false, true, false, false),
  ('warehouse_delay', 'Warehouse delay', 'Shipments stay where they are until you change the scenario.', 'approved', true, false, false, false),
  ('refund_wave', 'Partial refund wave', 'Advancing the clock files pending partial refunds for finance to complete.', 'approved', false, false, false, true),
  ('return_surge', 'Return surge', 'Advancing the clock opens return requests on delivered orders.', 'approved', false, false, true, false);

insert into public.simulation_state (id, scenario_key) values (1, 'happy_path');

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
      alter publication supabase_realtime add table public.orders;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'shipments') then
      alter publication supabase_realtime add table public.shipments;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'shipment_events') then
      alter publication supabase_realtime add table public.shipment_events;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'inventory') then
      alter publication supabase_realtime add table public.inventory;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'domain_events') then
      alter publication supabase_realtime add table public.domain_events;
    end if;
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit)
values ('product-media', 'product-media', true, 5242880)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
values ('avatars', 'avatars', true, 2097152)
on conflict (id) do nothing;

create policy product_media_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-media');
create policy product_media_write on storage.objects for insert to authenticated
  with check (bucket_id = 'product-media' and public.is_role(array['catalog', 'administrator']::public.user_role[]));
create policy avatars_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');
create policy avatars_write on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
