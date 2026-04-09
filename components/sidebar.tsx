'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Settings, Users, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { signOut } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/settings/team', label: 'Team', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-60 border-r bg-sidebar text-sidebar-foreground shrink-0">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <span className="font-semibold text-lg">ProjectFlow</span>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
              pathname === href
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <Separator />
      <div className="p-2 flex items-center justify-between">
        <ThemeToggle />
        <form action={signOut}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </aside>
  )
}
