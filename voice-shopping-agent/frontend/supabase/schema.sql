-- Run once in Supabase → SQL Editor. FastAPI owns catalog, cart, and orders;
-- wishlist preferences remain browser-local.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '', email text, size text not null default 'M',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "own profile read" on public.profiles for select using ((select auth.uid()) = id);
create policy "own profile insert" on public.profiles for insert with check ((select auth.uid()) = id);
create policy "own profile update" on public.profiles for update using ((select auth.uid()) = id);

-- Auto-create a profile row at sign-up.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
