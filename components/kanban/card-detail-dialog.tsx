'use client'

import { useActionState, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateCard, deleteCard } from '@/app/actions/card'
import type { KanbanCard } from './types'
import { cn } from '@/lib/utils'

const PRIORITIES = [
  { value: '', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

type Props = {
  card: KanbanCard
  boardId: string
  workspaceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (card: KanbanCard) => void
  onDeleted: (cardId: string) => void
}

export function CardDetailDialog({ card, boardId, workspaceId, open, onOpenChange, onUpdated, onDeleted }: Props) {
  const [state, action, pending] = useActionState(updateCard, null)
  const [deleting, setDeleting] = useState(false)

  // Track form field values in state so we can reconstruct the updated card
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [priority, setPriority] = useState(card.priority ?? '')
  const [dueDate, setDueDate] = useState(
    card.due_date ? card.due_date.split('T')[0] : ''
  )

  // Sync fields when dialog opens with a different card
  useEffect(() => {
    setTitle(card.title)
    setDescription(card.description ?? '')
    setPriority(card.priority ?? '')
    setDueDate(card.due_date ? card.due_date.split('T')[0] : '')
  }, [card.id])

  useEffect(() => {
    if (state?.success) {
      onUpdated({
        ...card,
        title,
        description: description || null,
        priority: priority || null,
        due_date: dueDate || null,
      })
      onOpenChange(false)
    }
  }, [state?.success]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete() {
    setDeleting(true)
    await deleteCard(card.id, boardId, workspaceId)
    onDeleted(card.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Card detail</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <input type="hidden" name="card_id" value={card.id} />
          <input type="hidden" name="board_id" value={boardId} />
          <input type="hidden" name="workspace_id" value={workspaceId} />

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="space-y-1">
            <Label htmlFor="card-title">Title</Label>
            <Input
              id="card-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="card-description">Description</Label>
            <Textarea
              id="card-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="card-priority">Priority</Label>
              <select
                id="card-priority"
                name="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="card-due">Due date</Label>
              <Input
                id="card-due"
                name="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-destructive hover:text-destructive gap-1')}
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting…' : 'Delete card'}
            </button>

            <Button type="submit" size="sm" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
