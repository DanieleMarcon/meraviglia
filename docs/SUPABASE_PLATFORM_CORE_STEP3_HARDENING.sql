-- ARCHITECTURE HARDENING A — STEP 3
-- Reusable updated_at trigger function + table triggers.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_intakes_set_updated_at on public.intakes;
create trigger trg_intakes_set_updated_at
before update on public.intakes
for each row
execute function public.set_updated_at();

drop trigger if exists trg_workspaces_set_updated_at on public.workspaces;
create trigger trg_workspaces_set_updated_at
before update on public.workspaces
for each row
execute function public.set_updated_at();

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists trg_roles_set_updated_at on public.roles;
create trigger trg_roles_set_updated_at
before update on public.roles
for each row
execute function public.set_updated_at();
