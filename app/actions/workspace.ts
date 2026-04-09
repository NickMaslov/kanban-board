'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50)
}

export async function createWorkspace(_prevState: unknown, formData: FormData) {
  // Verify the user is authenticated first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Workspace name is required' }

  const baseSlug = slugify(name)
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

  // Use admin client to bypass RLS for trusted server-side insert
  const { data: workspace, error } = await adminClient
    .from('workspaces')
    .insert({ name, slug, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  await adminClient.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'owner',
  })

  redirect(`/workspace/${workspace.id}/boards`)
}
