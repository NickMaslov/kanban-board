'use client'

import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cancelInvite } from '@/app/actions/team'
import { cn } from '@/lib/utils'

type Invite = { id: string; email: string; role: string; created_at: string; expires_at: string }

export function PendingInvites({ invites, workspaceId }: { invites: Invite[]; workspaceId: string }) {
  const [cancelling, setCancelling] = useState<string | null>(null)

  async function handleCancel(inviteId: string) {
    setCancelling(inviteId)
    await cancelInvite(inviteId, workspaceId)
    setCancelling(null)
  }

  return (
    <div className="border rounded-lg divide-y">
      {invites.map((invite) => (
        <div key={invite.id} className="flex items-center gap-3 p-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{invite.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{invite.role}</p>
          </div>
          <button
            onClick={() => handleCancel(invite.id)}
            disabled={cancelling === invite.id}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-destructive hover:text-destructive h-7 px-2 text-xs shrink-0')}
          >
            {cancelling === invite.id ? 'Cancelling…' : 'Cancel'}
          </button>
        </div>
      ))}
    </div>
  )
}
