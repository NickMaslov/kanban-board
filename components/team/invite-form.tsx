'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { inviteMember } from '@/app/actions/team'

const ROLES = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
]

export function InviteForm({ workspaceId }: { workspaceId: string }) {
  const [state, action, pending] = useActionState(inviteMember, null)

  return (
    <form action={action} className="flex gap-3 items-end flex-wrap">
      <input type="hidden" name="workspace_id" value={workspaceId} />

      <div className="space-y-1 flex-1 min-w-48">
        <Label htmlFor="invite-email">Email address</Label>
        <Input id="invite-email" name="email" type="email" placeholder="colleague@example.com" required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="invite-role">Role</Label>
        <select
          id="invite-role"
          name="role"
          className="h-8 rounded-md border border-input bg-background px-3 text-sm"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Sending…' : 'Send invite'}
      </Button>

      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="w-full text-sm text-green-600 dark:text-green-400">Invite sent!</p>}
    </form>
  )
}
