import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: workspaces }, { data: profile }] = await Promise.all([
    supabase.from('workspaces').select('id, name').order('created_at', { ascending: true }),
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
  ])

  if (!workspaces || workspaces.length === 0) {
    redirect('/onboarding')
  }

  const navUser = { email: user.email!, full_name: profile?.full_name ?? null }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar workspaces={workspaces} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={navUser} workspaces={workspaces} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
