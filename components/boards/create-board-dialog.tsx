'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBoard } from '@/app/actions/board'
import { cn } from '@/lib/utils'

export function CreateBoardDialog({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createBoard, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.board) {
      setOpen(false)
      formRef.current?.reset()
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ size: 'sm' }))}>
        <Plus className="h-4 w-4 mr-1" />
        New board
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create board</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={action} className="space-y-4">
          <input type="hidden" name="workspace_id" value={workspaceId} />
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="space-y-1">
            <Label htmlFor="board-name">Name</Label>
            <Input id="board-name" name="name" placeholder="e.g. Product Roadmap" required autoFocus />
          </div>
          <div className="space-y-1">
            <Label htmlFor="board-description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="board-description" name="description" placeholder="What is this board for?" />
          </div>
          <DialogFooter>
            <DialogClose className={cn(buttonVariants({ variant: 'outline' }))}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
