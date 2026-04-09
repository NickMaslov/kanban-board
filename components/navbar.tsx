'use client'

import { useParams, usePathname } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { signOut } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

type NavbarProps = {
  user: { email: string; full_name?: string | null }
  workspaces: { id: string; name: string }[]
}

function usePageTitle(workspaces: { id: string; name: string }[]) {
  const pathname = usePathname()
  const params = useParams()
  const workspaceId = typeof params.workspaceId === 'string' ? params.workspaceId : null
  const workspace = workspaces.find((w) => w.id === workspaceId)

  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname.includes('/boards') && workspace) return workspace.name
  if (pathname.includes('/board/') && workspace) return workspace.name
  if (pathname.includes('/settings/team')) return 'Team'
  if (pathname.includes('/settings')) return 'Settings'
  return 'ProjectFlow'
}

function initials(name: string | null | undefined, email: string) {
  if (name) return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return email[0].toUpperCase()
}

export function Navbar({ user, workspaces }: NavbarProps) {
  const title = usePageTitle(workspaces)
  const displayName = user.full_name || user.email

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b bg-background shrink-0">
      <h1 className="font-semibold text-sm">{title}</h1>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Separator orientation="vertical" className="h-5" />
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost' }), 'gap-2 px-2 h-8')}>
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{initials(user.full_name, user.email)}</AvatarFallback>
            </Avatar>
            <span className="text-sm hidden sm:block max-w-36 truncate">{displayName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{user.full_name || 'Account'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <form action={signOut} className="w-full">
                <button type="submit" className="flex items-center w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
