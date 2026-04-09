import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id, name, slug')
    .order('created_at', { ascending: true })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome back, {user?.email}</p>

      <section>
        <h2 className="text-lg font-semibold mb-4">Workspaces</h2>
        {!workspaces || workspaces.length === 0 ? (
          <p className="text-muted-foreground">No workspaces yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <div key={ws.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                <p className="font-medium">{ws.name}</p>
                <p className="text-xs text-muted-foreground">{ws.slug}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
