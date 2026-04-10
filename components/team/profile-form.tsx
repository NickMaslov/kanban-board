'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/actions/team'

export function ProfileForm({ profile }: { profile: { full_name: string | null; email: string } }) {
  const [state, action, pending] = useActionState(updateProfile, null)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="full-name">Full name</Label>
        <Input
          id="full-name"
          name="full_name"
          defaultValue={profile.full_name ?? ''}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile.email} disabled />
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600 dark:text-green-400">Profile updated!</p>}
    </form>
  )
}
