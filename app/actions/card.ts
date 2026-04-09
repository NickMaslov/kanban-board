'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export async function createCard(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const columnId = formData.get('column_id') as string
  const boardId = formData.get('board_id') as string
  const workspaceId = formData.get('workspace_id') as string
  const title = (formData.get('title') as string).trim()
  if (!title) return { error: 'Title is required' }

  const { data: last } = await adminClient
    .from('cards')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (last?.position ?? -1) + 1

  const { data: card, error } = await adminClient
    .from('cards')
    .insert({ column_id: columnId, title, position, created_by: user.id })
    .select('id, column_id, title, description, position, priority, due_date')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`)
  return { card }
}

export async function updateCard(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const cardId = formData.get('card_id') as string
  const boardId = formData.get('board_id') as string
  const workspaceId = formData.get('workspace_id') as string
  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string | null)?.trim() || null
  const priority = (formData.get('priority') as string | null) || null
  const due_date = (formData.get('due_date') as string | null) || null

  if (!title) return { error: 'Title is required' }

  const { error } = await adminClient
    .from('cards')
    .update({ title, description, priority, due_date })
    .eq('id', cardId)

  if (error) return { error: error.message }

  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`)
  return { success: true }
}

export async function deleteCard(cardId: string, boardId: string, workspaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await adminClient.from('cards').delete().eq('id', cardId)
  if (error) throw new Error(error.message)

  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`)
}

export async function moveCard(
  cardId: string,
  newColumnId: string,
  newPosition: number,
  boardId: string,
  workspaceId: string
) {
  const { error } = await adminClient
    .from('cards')
    .update({ column_id: newColumnId, position: newPosition })
    .eq('id', cardId)

  if (error) throw new Error(error.message)

  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`)
}

export async function reorderCards(
  cards: { id: string; column_id: string; position: number }[],
  boardId: string,
  workspaceId: string
) {
  for (const card of cards) {
    await adminClient
      .from('cards')
      .update({ column_id: card.column_id, position: card.position })
      .eq('id', card.id)
  }
  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`)
}
