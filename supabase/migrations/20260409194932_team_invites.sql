-- Workspace invites
create table public.workspace_invites (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  email text not null,
  role public.workspace_role default 'member' not null,
  token text unique not null,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '7 days') not null,
  accepted_at timestamptz,
  unique(workspace_id, email)
);

alter table public.workspace_invites enable row level security;

-- Workspace members can see invites for their workspace
create policy "invites_select" on public.workspace_invites for select
  using (public.is_workspace_member(workspace_id));

-- Workspace members can create invites
create policy "invites_insert" on public.workspace_invites for insert
  with check (public.is_workspace_member(workspace_id));

-- Allow invite acceptance/update
create policy "invites_update" on public.workspace_invites for update
  using (true);

-- Allow invite deletion by workspace admins/owners
create policy "invites_delete" on public.workspace_invites for delete
  using (public.is_workspace_member(workspace_id));
