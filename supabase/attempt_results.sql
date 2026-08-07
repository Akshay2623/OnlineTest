create table if not exists public.attempt_results (
  id text primary key,
  student_name text not null,
  category_id text not null,
  category_name text not null,
  test_id text not null,
  test_name text not null,
  submitted_at date not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists attempt_results_submitted_at_idx
  on public.attempt_results (submitted_at desc);

create index if not exists attempt_results_test_id_idx
  on public.attempt_results (test_id);

alter table public.attempt_results enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'attempt_results'
      and policyname = 'allow anon read attempt results'
  ) then
    create policy "allow anon read attempt results"
      on public.attempt_results
      for select
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'attempt_results'
      and policyname = 'allow anon insert attempt results'
  ) then
    create policy "allow anon insert attempt results"
      on public.attempt_results
      for insert
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'attempt_results'
      and policyname = 'allow anon update attempt results'
  ) then
    create policy "allow anon update attempt results"
      on public.attempt_results
      for update
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'attempt_results'
      and policyname = 'allow anon delete attempt results'
  ) then
    create policy "allow anon delete attempt results"
      on public.attempt_results
      for delete
      using (true);
  end if;
end $$;
