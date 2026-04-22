-- Atomic reservation request creation (pending status, no date blocking yet).
-- Called by the reservation Server Action (service role).

create or replace function public.create_reservation_with_blocks(
  p_reservation jsonb,
  p_dates date[]
) returns uuid
language plpgsql
security definer
as $$
declare
  new_id uuid;
begin
  -- Fail fast if any requested date is already blocked.
  if exists (
    select 1 from blocked_dates where date = any(p_dates)
  ) then
    raise exception 'DATES_CONFLICT' using errcode = 'P0001';
  end if;

  insert into reservations (
    check_in, check_out, nights, guests,
    doc_type, doc_number, first_name, last_name,
    email, phone, message, consent,
    nightly_breakdown, total_cents, currency, status
  )
  values (
    (p_reservation->>'check_in')::date,
    (p_reservation->>'check_out')::date,
    (p_reservation->>'nights')::int,
    (p_reservation->>'guests')::int,
    (p_reservation->>'doc_type')::doc_type,
    p_reservation->>'doc_number',
    p_reservation->>'first_name',
    p_reservation->>'last_name',
    p_reservation->>'email',
    p_reservation->>'phone',
    p_reservation->>'message',
    (p_reservation->>'consent')::boolean,
    p_reservation->>'nightly_breakdown',
    (p_reservation->>'total_cents')::int,
    coalesce(p_reservation->>'currency','USD'),
    'pending'
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.create_reservation_with_blocks(jsonb, date[]) from public;
-- Only service role + the owner's server can call this (server action invokes via service client).
