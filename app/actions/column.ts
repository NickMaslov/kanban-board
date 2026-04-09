'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export async function createColumn(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const boardId = formData.get('board_id') as string
  const workspaceId = formData.get('workspace_id') as string
  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Column name is required' }

  const { data: last } = await adminClient
    .from('columns')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (last?.position ?? -1) + 1

  const { data: column, error } = await adminClient
    .from('columns')
    .insert({ board_id: boardId, name, position })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`)
  return { column }
}

export async function updateColumn(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const columnId = formData.get('column_id') as string
  const boardId = formData.get('board_id') as string
  const workspaceId = formData.get('workspace_id') as string
  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Column name is required' }

  const { error } = await adminClient.from('columns').update({ name }).eq('id', columnId)
  if (error) return { error: error.message }

  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`)
  return { success: true }
}

export async function deleteColumn(columnId: string, boardId: string, workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await adminClient.from('columns').delete().eq('id', columnId)
  if (error) throw new Error(error.message)

  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`)
}

export async function reorderColumns(
  columns: { id: string; position: number }[],
  boardId: string,
  workspaceId: string
) {
  for (const col of columns) {
    await adminClient.from('columns').update({ position: col.position }).eq('id', col.id)
  }
  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`)
}
