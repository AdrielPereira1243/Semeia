create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.planner_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pioneer_type text not null default 'pioneiro auxiliar 15h'
    check (pioneer_type in (
      'pioneiro auxiliar 15h',
      'pioneiro auxiliar 30h',
      'pioneiro regular',
      'especial'
    )),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('revisita', 'estudo')),
  person_name text not null default '',
  address text not null default '',
  subject text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  date date not null,
  hours numeric(6,2) not null check (hours > 0 and hours <= 24),
  activity_type text not null check (activity_type in (
    'campo',
    'cartas',
    'testemunho informal',
    'carrinho',
    'revisita',
    'estudo'
  )),
  details text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_user_type_idx on public.contacts (user_id, type);
create index entries_user_date_idx on public.entries (user_id, date desc);
create index entries_contact_id_idx on public.entries (contact_id) where contact_id is not null;

alter table public.profiles enable row level security;
alter table public.planner_settings enable row level security;
alter table public.contacts enable row level security;
alter table public.entries enable row level security;

create policy profiles_select_own
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy planner_settings_select_own
on public.planner_settings for select
to authenticated
using ((select auth.uid()) = user_id);

create policy planner_settings_insert_own
on public.planner_settings for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy planner_settings_update_own
on public.planner_settings for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy planner_settings_delete_own
on public.planner_settings for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy contacts_select_own
on public.contacts for select
to authenticated
using ((select auth.uid()) = user_id);

create policy contacts_insert_own
on public.contacts for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy contacts_update_own
on public.contacts for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy contacts_delete_own
on public.contacts for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy entries_select_own
on public.entries for select
to authenticated
using ((select auth.uid()) = user_id);

create policy entries_insert_own
on public.entries for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = entries.contact_id
        and contacts.user_id = (select auth.uid())
    )
  )
);

create policy entries_update_own
on public.entries for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    contact_id is null
    or exists (
      select 1
      from public.contacts
      where contacts.id = entries.contact_id
        and contacts.user_id = (select auth.uid())
    )
  )
);

create policy entries_delete_own
on public.entries for delete
to authenticated
using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.planner_settings to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.entries to authenticated;

revoke all on public.profiles from anon;
revoke all on public.planner_settings from anon;
revoke all on public.contacts from anon;
revoke all on public.entries from anon;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 'Usuario')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

insert into public.profiles (id, name)
select
  id,
  coalesce(nullif(trim(raw_user_meta_data ->> 'name'), ''), 'Usuario')
from auth.users
on conflict (id) do nothing;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
