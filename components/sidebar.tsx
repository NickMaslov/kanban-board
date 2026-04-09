'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { LayoutDashboard, Settings, Users, Layout } from 'lucide-react'
import { WorkspaceSwitcher } from '@/components/workspace-switcher'
import { cn } from '@/lib/utils'

type Workspace = { id: string; name: string }

const globalNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

function workspaceNav(workspaceId: string) {
  return [
    { href: `/workspace/${workspaceId}/boards`, label: 'Boards', icon: Layout },
    { href: `/workspace/${workspaceId}/settings/team`, label: 'Team', icon: Users },
    { href: `/workspace/${workspaceId}/settings`, label: 'Settings', icon: Settings },
  ]
}

export function Sidebar({ workspaces }: { workspaces: Workspace[] }) {
  const pathname = usePathname()
  const params = useParams()
  const workspaceId = typeof params.workspaceId === 'string' ? params.workspaceId : null

  const navItems = [
    ...globalNav,
    ...(workspaceId ? workspaceNav(workspaceId) : []),
  ]

  return (
    <aside className="flex flex-col w-60 border-r bg-sidebar text-sidebar-foreground shrink-0">
      <div className="flex items-center gap-2 px-4 h-14 border-b">
        <span className="font-semibold">ProjectFlow</span>
      </div>

      <div className="px-3 py-3 border-b">
        <p className="text-xs font-medium text-muted-foreground px-2 mb-1">Workspace</p>
        <WorkspaceSwitcher workspaces={workspaces} currentWorkspaceId={workspaceId} />
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
