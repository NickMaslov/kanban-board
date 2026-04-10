import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { InviteForm } from '@/components/team/invite-form'
import { MemberList } from '@/components/team/member-list'
import { PendingInvites } from '@/components/team/pending-invites'

export default async function TeamPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: workspace } = await adminClient
    .from('workspaces')
    .select('id, name')
    .eq('id', workspaceId)
    .single()

  if (!workspace) return notFound()

  const [{ data: members }, { data: invites }, { data: currentMembership }] = await Promise.all([
    adminClient
      .from('workspace_members')
      .select('id, role, joined_at, profiles(id, full_name, email, avatar_url)')
      .eq('workspace_id', workspaceId)
      .order('joined_at', { ascending: true }),
    adminClient
      .from('workspace_invites')
      .select('id, email, role, created_at, expires_at')
      .eq('workspace_id', workspaceId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }),
    adminClient
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single(),
  ])

  const canManage = currentMembership?.role === 'owner' || currentMembership?.role === 'admin'

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Team</h1>
      <p className="text-muted-foreground mb-8">{workspace.name}</p>

      {canManage && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold mb-3">Invite member</h2>
          <InviteForm workspaceId={workspaceId} />
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-sm font-semibold mb-3">Members ({members?.length ?? 0})</h2>
        <MemberList
          members={members ?? []}
          currentUserId={user.id}
          currentRole={currentMembership?.role ?? 'member'}
          workspaceId={workspaceId}
        />
      </section>

      {canManage && invites && invites.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3">Pending invites</h2>
          <PendingInvites invites={invites} workspaceId={workspaceId} />
        </section>
      )}
    </div>
  )
}
