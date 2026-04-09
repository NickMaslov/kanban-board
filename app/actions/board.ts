'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export async function createBoard(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const workspaceId = formData.get('workspace_id') as string
  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null

  if (!name) return { error: 'Board name is required' }

  const { data: board, error } = await adminClient
    .from('boards')
    .insert({ workspace_id: workspaceId, name, description, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/workspace/${workspaceId}/boards`)
  return { board }
}

export async function updateBoard(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const boardId = formData.get('board_id') as string
  const workspaceId = formData.get('workspace_id') as string
  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null

  if (!name) return { error: 'Board name is required' }

  const { error } = await adminClient
    .from('boards')
    .update({ name, description })
    .eq('id', boardId)

  if (error) return { error: error.message }

  revalidatePath(`/workspace/${workspaceId}/boards`)
  return { success: true }
}

export async function deleteBoard(boardId: string, workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await adminClient.from('boards').delete().eq('id', boardId)
  if (error) throw new Error(error.message)

  revalidatePath(`/workspace/${workspaceId}/boards`)
}

export async function updateWorkspace(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const workspaceId = formData.get('workspace_id') as string
  const name = (formData.get('name') as string).trim()

  if (!name) return { error: 'Workspace name is required' }

  const { error } = await adminClient
    .from('workspaces')
    .update({ name })
    .eq('id', workspaceId)

  if (error) return { error: error.message }

  revalidatePath(`/workspace/${workspaceId}`)
  return { success: true }
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await adminClient.from('workspaces').delete().eq('id', workspaceId)
  if (error) throw new Error(error.message)

  redirect('/dashboard')
}
