'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { changeMemberRole, removeMember } from '@/app/actions/team'
import { cn } from '@/lib/utils'

type Profile = { id: string; full_name: string | null; email: string; avatar_url: string | null }
type Member = { id: string; role: string; joined_at: string; profiles: Profile | Profile[] | null }

const ROLES = ['member', 'admin', 'owner']

function initials(name: string | null, email: string) {
  if (name) return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return email[0].toUpperCase()
}

function getProfile(profiles: Profile | Profile[] | null): Profile | null {
  if (!profiles) return null
  return Array.isArray(profiles) ? profiles[0] : profiles
}

export function MemberList({
  members,
  currentUserId,
  currentRole,
  workspaceId,
}: {
  members: Member[]
  currentUserId: string
  currentRole: string
  workspaceId: string
}) {
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null)
  const [removing, setRemoving] = useState(false)
  const canManage = currentRole === 'owner' || currentRole === 'admin'

  async function handleRoleChange(member: Member, newRole: string) {
    await changeMemberRole(member.id, newRole, workspaceId)
  }

  async function handleRemove() {
    if (!removeTarget) return
    setRemoving(true)
    await removeMember(removeTarget.id, workspaceId)
    setRemoving(false)
    setRemoveTarget(null)
  }

  return (
    <>
      <div className="border rounded-lg divide-y">
        {members.map((member) => {
          const profile = getProfile(member.profiles)
          const isCurrentUser = profile?.id === currentUserId
          const isOwner = member.role === 'owner'

          return (
            <div key={member.id} className="flex items-center gap-3 p-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {initials(profile?.full_name ?? null, profile?.email ?? '?')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || profile?.email}
                  {isCurrentUser && <span className="text-muted-foreground font-normal"> (you)</span>}
                </p>
                {profile?.full_name && (
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                )}
              </div>

              {canManage && !isOwner && !isCurrentUser ? (
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    defaultValue={member.role}
                    onChange={(e) => handleRoleChange(member, e.target.value)}
                    className="h-7 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setRemoveTarget(member)}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-destructive hover:text-destructive h-7 px-2 text-xs')}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground capitalize shrink-0">{member.role}</span>
              )}
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const p = getProfile(removeTarget?.profiles ?? null)
                return `${p?.full_name || p?.email} will lose access to this workspace.`
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? 'Removing…' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
