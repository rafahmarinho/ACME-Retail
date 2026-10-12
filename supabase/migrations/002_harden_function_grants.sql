-- Hardening after the Supabase security advisor run (2026-10-12).
-- Postgres grants EXECUTE to PUBLIC by default, so the anon role could call the
-- SECURITY DEFINER RPCs through PostgREST. The functions check auth.uid() and the
-- caller's role themselves, but only signed-in users should reach them.
-- compute_totals and is_role stay callable by anon: the cart preview uses the
-- first, and the RLS policies evaluate the second for anonymous catalog reads.

alter function public.touch_updated_at() set search_path = public;

revoke execute on function public.place_order(jsonb, text, jsonb, jsonb, text, text) from public, anon;
revoke execute on function public.settle_payment(uuid, text, text, text) from public, anon;
revoke execute on function public.cancel_order(uuid, text) from public, anon;
revoke execute on function public.mark_picking(uuid) from public, anon;
revoke execute on function public.create_shipment(uuid, text) from public, anon;
revoke execute on function public.advance_shipment(uuid) from public, anon;
revoke execute on function public.request_return(uuid, jsonb, text) from public, anon;
revoke execute on function public.review_return(uuid, text) from public, anon;
revoke execute on function public.issue_refund(uuid, integer, text, uuid, uuid) from public, anon;
revoke execute on function public.adjust_inventory(uuid, integer, text) from public, anon;
revoke execute on function public.set_scenario(text) from public, anon;
revoke execute on function public.advance_simulation() from public, anon;
revoke execute on function public.release_expired_reservations() from public, anon;

-- Internal helpers. They only run inside the SECURITY DEFINER functions above,
-- which execute as the function owner, so no API role needs them.
revoke execute on function public.log_event(text, text, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.release_order_stock(uuid) from public, anon, authenticated;
revoke execute on function public.current_role() from public, anon, authenticated;
