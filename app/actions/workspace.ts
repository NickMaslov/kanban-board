'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50)
}

export async function createWorkspace(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Workspace name is required' }

  const baseSlug = slugify(name)
  // Ensure slug is unique by appending random suffix if needed
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .insert({ name, slug, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  // Add creator as owner
  await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'owner',
  })

  redirect(`/dashboard?workspace=${workspace.id}`)
}
