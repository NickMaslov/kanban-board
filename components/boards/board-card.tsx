'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateBoard, deleteBoard } from '@/app/actions/board'
import { cn } from '@/lib/utils'

type Board = { id: string; name: string; description: string | null; created_at: string }

export function BoardCard({ board, workspaceId }: { board: Board; workspaceId: string }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editState, editAction, editPending] = useActionState(updateBoard, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (editState?.success) setEditOpen(false)
  }, [editState])

  async function handleDelete() {
    setDeleting(true)
    await deleteBoard(board.id, workspaceId)
  }

  return (
    <>
      <div className="group relative border rounded-lg p-4 hover:bg-accent transition-colors">
        <Link href={`/workspace/${workspaceId}/board/${board.id}`} className="block pr-8">
          <p className="font-medium">{board.name}</p>
          {board.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{board.description}</p>
          )}
        </Link>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-7')}
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit board</DialogTitle>
          </DialogHeader>
          <form ref={formRef} action={editAction} className="space-y-4">
            <input type="hidden" name="board_id" value={board.id} />
            <input type="hidden" name="workspace_id" value={workspaceId} />
            {editState?.error && (
              <p className="text-sm text-destructive">{editState.error}</p>
            )}
            <div className="space-y-1">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" name="name" defaultValue={board.name} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" name="description" defaultValue={board.description ?? ''} />
            </div>
            <DialogFooter>
              <DialogClose className={cn(buttonVariants({ variant: 'outline' }))}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={editPending}>
                {editPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{board.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the board and all its cards. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
