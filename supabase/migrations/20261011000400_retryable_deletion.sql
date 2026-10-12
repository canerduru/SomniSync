-- Renew a lease only with its existing token. Every media cleanup batch renews it.
create or replace function public.claim_mutation(p_user uuid, p_token uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  insert into private.mutation_leases values(p_user,p_token,now()+interval '5 minutes')
  on conflict(user_id) do update set token=excluded.token, expires_at=excluded.expires_at
    where private.mutation_leases.expires_at < now() or private.mutation_leases.token=excluded.token;
  return found;
end; $$;
-- Keep a failed single-dream deletion visible to its owner for an explicit retry.
-- Updates remain blocked by WITH CHECK; social queries exclude pending deletions.
drop policy dreams_active on public.dreams;
create policy dreams_active on public.dreams as restrictive for all to authenticated
 using (public.account_active())
 with check (public.account_active() and deletion_requested_at is null);
