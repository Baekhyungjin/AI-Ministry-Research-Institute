alter table public.applications
  add column if not exists requested_date date;

create index if not exists applications_requested_date_index
  on public.applications (requested_date)
  where requested_date is not null;
