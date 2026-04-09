-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Workspaces
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Workspace members with roles
create type public.workspace_role as enum ('owner', 'admin', 'member');

create table public.workspace_members (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role workspace_role default 'member' not null,
  joined_at timestamptz default now() not null,
  unique(workspace_id, user_id)
);

-- Boards
create table public.boards (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Columns
create table public.columns (
  id uuid default uuid_generate_v4() primary key,
  board_id uuid references public.boards(id) on delete cascade not null,
  name text not null,
  position integer default 0 not null,
  created_at timestamptz default now() not null
);

-- Cards
create table public.cards (
  id uuid default uuid_generate_v4() primary key,
  column_id uuid references public.columns(id) on delete cascade not null,
  title text not null,
  description text,
  position integer default 0 not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date date,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.cards enable row level security;

-- Profiles: users can read their own profile; update their own
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Workspace members helper: is user a member of workspace?
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$;

-- Workspaces: readable by members
create policy "workspaces_select" on public.workspaces for select
  using (public.is_workspace_member(id));
create policy "workspaces_insert" on public.workspaces for insert
  with check (auth.uid() is not null);
create policy "workspaces_update" on public.workspaces for update
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = id and user_id = auth.uid() and role in ('owner', 'admin')
  ));

-- Workspace members: readable by members of same workspace
create policy "workspace_members_select" on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));
create policy "workspace_members_insert" on public.workspace_members for insert
  with check (auth.uid() is not null);

-- Boards: readable by workspace members
create policy "boards_select" on public.boards for select
  using (public.is_workspace_member(workspace_id));
create policy "boards_insert" on public.boards for insert
  with check (public.is_workspace_member(workspace_id));
create policy "boards_update" on public.boards for update
  using (public.is_workspace_member(workspace_id));
create policy "boards_delete" on public.boards for delete
  using (public.is_workspace_member(workspace_id));

-- Columns: readable by board workspace members
create policy "columns_select" on public.columns for select
  using (exists (
    select 1 from public.boards b
    where b.id = board_id and public.is_workspace_member(b.workspace_id)
  ));
create policy "columns_insert" on public.columns for insert
  with check (exists (
    select 1 from public.boards b
    where b.id = board_id and public.is_workspace_member(b.workspace_id)
  ));
create policy "columns_update" on public.columns for update
  using (exists (
    select 1 from public.boards b
    where b.id = board_id and public.is_workspace_member(b.workspace_id)
  ));
create policy "columns_delete" on public.columns for delete
  using (exists (
    select 1 from public.boards b
    where b.id = board_id and public.is_workspace_member(b.workspace_id)
  ));

-- Cards: readable by column board workspace members
create policy "cards_select" on public.cards for select
  using (exists (
    select 1 from public.columns col
    join public.boards b on b.id = col.board_id
    where col.id = column_id and public.is_workspace_member(b.workspace_id)
  ));
create policy "cards_insert" on public.cards for insert
  with check (exists (
    select 1 from public.columns col
    join public.boards b on b.id = col.board_id
    where col.id = column_id and public.is_workspace_member(b.workspace_id)
  ));
create policy "cards_update" on public.cards for update
  using (exists (
    select 1 from public.columns col
    join public.boards b on b.id = col.board_id
    where col.id = column_id and public.is_workspace_member(b.workspace_id)
  ));
create policy "cards_delete" on public.cards for delete
  using (exists (
    select 1 from public.columns col
    join public.boards b on b.id = col.board_id
    where col.id = column_id and public.is_workspace_member(b.workspace_id)
  ));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger workspaces_updated_at before update on public.workspaces
  for each row execute procedure public.set_updated_at();
create trigger boards_updated_at before update on public.boards
  for each row execute procedure public.set_updated_at();
create trigger cards_updated_at before update on public.cards
  for each row execute procedure public.set_updated_at();
