import { acceptInvite } from '@/app/actions/team'
import { adminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const { data: invite } = await adminClient
    .from('workspace_invites')
    .select('email, role, expires_at, accepted_at, workspaces(name)')
    .eq('token', token)
    .single()

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader><CardTitle>Invalid invite</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">This invite link is invalid or has expired.</p></CardContent>
          <CardFooter><Link href="/login" className={cn(buttonVariants(), 'w-full')}>Go to login</Link></CardFooter>
        </Card>
      </div>
    )
  }

  const expired = new Date(invite.expires_at) < new Date()
  const accepted = !!invite.accepted_at
  // @ts-expect-error supabase join type
  const workspaceName = invite.workspaces?.name ?? 'a workspace'

  if (expired || accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{accepted ? 'Already accepted' : 'Invite expired'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {accepted
                ? 'This invite has already been accepted.'
                : 'This invite link has expired. Ask your workspace owner for a new one.'}
            </p>
          </CardContent>
          <CardFooter><Link href="/dashboard" className={cn(buttonVariants(), 'w-full')}>Go to dashboard</Link></CardFooter>
        </Card>
      </div>
    )
  }

  // Auto-accept for logged-in users
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await acceptInvite(token)
    // acceptInvite redirects, this line won't be reached
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Join {workspaceName}</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join <strong>{workspaceName}</strong> as a{' '}
            <strong>{invite.role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Link
            href={`/signup?next=/invite/${token}`}
            className={cn(buttonVariants(), 'w-full')}
          >
            Create account &amp; accept
          </Link>
          <Link
            href={`/login?next=/invite/${token}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            Sign in &amp; accept
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
