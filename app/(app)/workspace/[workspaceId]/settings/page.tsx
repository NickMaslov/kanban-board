import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { ProfileForm } from '@/components/team/profile-form'
import { notFound } from 'next/navigation'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  await params // consume params (not needed here but required by Next.js)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: profile } = await adminClient
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your profile</p>

      <section>
        <h2 className="text-sm font-semibold mb-3">Profile</h2>
        <ProfileForm profile={profile ?? { full_name: null, email: user.email ?? '' }} />
      </section>
    </div>
  )
}
