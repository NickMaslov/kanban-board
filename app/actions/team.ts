'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { sendInviteEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function inviteMember(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const workspaceId = formData.get('workspace_id') as string
  const email = (formData.get('email') as string).trim().toLowerCase()
  const role = (formData.get('role') as string) || 'member'

  if (!email) return { error: 'Email is required' }

  // Check inviter is owner or admin
  const { data: membership } = await adminClient
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { error: 'Only owners and admins can invite members' }
  }

  // Check if already a member
  const { data: existingMember } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingMember) {
    const { data: alreadyMember } = await adminClient
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', existingMember.id)
      .single()

    if (alreadyMember) return { error: 'This person is already a member' }
  }

  // Upsert invite (refresh if re-inviting)
  const token = randomBytes(24).toString('hex')
  const { error } = await adminClient
    .from('workspace_invites')
    .upsert(
      {
        workspace_id: workspaceId,
        email,
        role,
        token,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        accepted_at: null,
      },
      { onConflict: 'workspace_id,email' }
    )

  if (error) return { error: error.message }

  // Get workspace name and inviter name for email
  const [{ data: workspace }, { data: inviterProfile }] = await Promise.all([
    adminClient.from('workspaces').select('name').eq('id', workspaceId).single(),
    adminClient.from('profiles').select('full_name, email').eq('id', user.id).single(),
  ])

  await sendInviteEmail(
    email,
    workspace?.name ?? 'a workspace',
    inviterProfile?.full_name ?? inviterProfile?.email ?? 'Someone',
    token
  ).catch(() => null)

  revalidatePath(`/workspace/${workspaceId}/settings/team`)
  return { success: true }
}

export async function changeMemberRole(memberId: string, role: string, workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await adminClient
    .from('workspace_members')
    .update({ role })
    .eq('id', memberId)

  if (error) throw new Error(error.message)
  revalidatePath(`/workspace/${workspaceId}/settings/team`)
}

export async function removeMember(memberId: string, workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await adminClient
    .from('workspace_members')
    .delete()
    .eq('id', memberId)

  if (error) throw new Error(error.message)
  revalidatePath(`/workspace/${workspaceId}/settings/team`)
}

export async function cancelInvite(inviteId: string, workspaceId: string) {
  const { error } = await adminClient
    .from('workspace_invites')
    .delete()
    .eq('id', inviteId)

  if (error) throw new Error(error.message)
  revalidatePath(`/workspace/${workspaceId}/settings/team`)
}

export async function acceptInvite(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/invite/${token}`)

  const { data: invite } = await adminClient
    .from('workspace_invites')
    .select('id, workspace_id, email, role, expires_at, accepted_at')
    .eq('token', token)
    .single()

  if (!invite) return { error: 'Invite not found or already used' }
  if (invite.accepted_at) return { error: 'This invite has already been accepted' }
  if (new Date(invite.expires_at) < new Date()) return { error: 'This invite has expired' }

  // Add member
  const { error: memberError } = await adminClient
    .from('workspace_members')
    .upsert(
      { workspace_id: invite.workspace_id, user_id: user.id, role: invite.role },
      { onConflict: 'workspace_id,user_id' }
    )

  if (memberError) return { error: memberError.message }

  // Mark accepted
  await adminClient
    .from('workspace_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  redirect(`/workspace/${invite.workspace_id}/boards`)
}

export async function updateProfile(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const full_name = (formData.get('full_name') as string).trim()
  if (!full_name) return { error: 'Name is required' }

  const { error } = await adminClient
    .from('profiles')
    .update({ full_name })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}
