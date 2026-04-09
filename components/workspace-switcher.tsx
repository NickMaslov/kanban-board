'use client'

import { useRouter } from 'next/navigation'
import { ChevronsUpDown, Plus, Check } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type Workspace = { id: string; name: string }

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspaceId,
}: {
  workspaces: Workspace[]
  currentWorkspaceId: string | null
}) {
  const router = useRouter()
  const current = workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0] ?? null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-between px-3 font-medium text-sm h-9')}
      >
        <span className="truncate">{current?.name ?? 'Select workspace'}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 ml-1 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => router.push(`/workspace/${ws.id}/boards`)}
            className="justify-between"
          >
            <span className="truncate">{ws.name}</span>
            {ws.id === current?.id && <Check className="h-4 w-4 shrink-0" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/onboarding')}>
          <Plus className="h-4 w-4 mr-2" />
          New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
