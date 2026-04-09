'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { cn } from '@/lib/utils'
import type { KanbanCard, KanbanColumn } from './types'
import { SortableCard } from './sortable-card'
import { createCard } from '@/app/actions/card'
import { deleteColumn, updateColumn } from '@/app/actions/column'

type Props = {
  column: KanbanColumn
  cards: KanbanCard[]
  boardId: string
  workspaceId: string
  onDeleted: (columnId: string) => void
  onRenamed: (columnId: string, name: string) => void
  onCardAdded: (card: KanbanCard) => void
  onCardUpdated: (card: KanbanCard) => void
  onCardDeleted: (cardId: string) => void
}

export function KanbanColumnComponent({
  column, cards, boardId, workspaceId,
  onDeleted, onRenamed, onCardAdded, onCardUpdated, onCardDeleted,
}: Props) {
  const { setNodeRef } = useDroppable({ id: column.id })
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(column.name)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [addingCard, setAddingCard] = useState(false)
  const [cardTitle, setCardTitle] = useState('')
  const [cardState, cardAction, cardPending] = useActionState(createCard, null)
  const cardFormRef = useRef<HTMLFormElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (cardState?.card) {
      onCardAdded(cardState.card as KanbanCard)
      setCardTitle('')
      setAddingCard(false)
      cardFormRef.current?.reset()
    }
  }, [cardState])

  useEffect(() => {
    if (renaming) renameRef.current?.focus()
  }, [renaming])

  async function handleRename() {
    const name = renameValue.trim()
    if (!name || name === column.name) { setRenaming(false); return }
    const fd = new FormData()
    fd.set('column_id', column.id)
    fd.set('board_id', boardId)
    fd.set('workspace_id', workspaceId)
    fd.set('name', name)
    await updateColumn(null, fd)
    onRenamed(column.id, name)
    setRenaming(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteColumn(column.id, boardId, workspaceId)
    onDeleted(column.id)
  }

  return (
    <div className="shrink-0 w-72 flex flex-col gap-2">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        {renaming ? (
          <Input
            ref={renameRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false) }}
            className="h-7 text-sm font-medium"
          />
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-sm font-medium truncate">{column.name}</h3>
            <span className="text-xs text-muted-foreground shrink-0">{cards.length}</span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-7 shrink-0')}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setRenameValue(column.name); setRenaming(true) }}>
              <Pencil className="h-4 w-4 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 min-h-[2rem] rounded-lg"
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              boardId={boardId}
              workspaceId={workspaceId}
              onUpdated={onCardUpdated}
              onDeleted={onCardDeleted}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      {addingCard ? (
        <form ref={cardFormRef} action={cardAction} className="flex flex-col gap-2">
          <input type="hidden" name="column_id" value={column.id} />
          <input type="hidden" name="board_id" value={boardId} />
          <input type="hidden" name="workspace_id" value={workspaceId} />
          <Input
            name="title"
            placeholder="Card title"
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Escape') setAddingCard(false) }}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={cardPending || !cardTitle.trim()}
              className={cn(buttonVariants({ size: 'sm' }), 'flex-1')}
            >
              {cardPending ? 'Adding…' : 'Add card'}
            </button>
            <button
              type="button"
              onClick={() => setAddingCard(false)}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAddingCard(true)}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'justify-start gap-2 text-muted-foreground w-full'
          )}
        >
          <Plus className="h-4 w-4" /> Add card
        </button>
      )}

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{column.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              All cards in this column will be deleted. This cannot be undone.
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
    </div>
  )
}
