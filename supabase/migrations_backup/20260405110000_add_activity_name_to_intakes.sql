begin;

alter table public.intakes
  add column if not exists activity_name text;

update public.intakes
set activity_name = nullif(trim(first_name), '')
where activity_name is null;

update public.intakes
set activity_name = 'Unnamed activity'
where activity_name is null;

alter table public.intakes
  alter column activity_name set not null;

commit;
