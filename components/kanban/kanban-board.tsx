'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { KanbanCard, KanbanColumn } from './types'
import { KanbanColumnComponent } from './kanban-column'
import { CardTile } from './card-tile'
import { AddColumnForm } from './add-column-form'
import { reorderCards } from '@/app/actions/card'
import { reorderColumns } from '@/app/actions/column'

type Props = {
  boardId: string
  workspaceId: string
  initialColumns: KanbanColumn[]
  initialCards: KanbanCard[]
}

export function KanbanBoard({ boardId, workspaceId, initialColumns, initialCards }: Props) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns)
  const [cards, setCards] = useState<KanbanCard[]>(initialCards)
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null)
  const [showAddColumn, setShowAddColumn] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const cardsForColumn = useCallback(
    (columnId: string) =>
      cards
        .filter((c) => c.column_id === columnId)
        .sort((a, b) => a.position - b.position),
    [cards]
  )

  function onDragStart(event: DragStartEvent) {
    const card = cards.find((c) => c.id === event.active.id)
    if (card) setActiveCard(card)
  }

  // Only update column_id when dragging across columns — do NOT reorder here.
  // Reordering happens in onDragEnd after the final position is known.
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggingCard = cards.find((c) => c.id === active.id)
    if (!draggingCard) return

    const overCard = cards.find((c) => c.id === over.id)
    const overColumn = columns.find((c) => c.id === over.id)

    // Determine target column
    const targetColumnId = overCard
      ? overCard.column_id
      : overColumn
        ? overColumn.id
        : null

    // Only update if moving to a different column
    if (targetColumnId && targetColumnId !== draggingCard.column_id) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === draggingCard.id ? { ...c, column_id: targetColumnId } : c
        )
      )
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)
    if (!over) return

    // ── Card drag ──
    const draggingCard = cards.find((c) => c.id === active.id)
    if (draggingCard) {
      // column_id may have changed during onDragOver — use the current state
      const currentColumnId = draggingCard.column_id

      const columnCards = cards
        .filter((c) => c.column_id === currentColumnId)
        .sort((a, b) => a.position - b.position)

      const oldIndex = columnCards.findIndex((c) => c.id === active.id)
      // over.id is either another card or the column itself
      const newIndex = columnCards.findIndex((c) => c.id === over.id)

      const reordered =
        oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex
          ? arrayMove(columnCards, oldIndex, newIndex)
          : columnCards

      const updated = reordered.map((c, i) => ({ ...c, position: i }))

      setCards((prev) => {
        const otherCards = prev.filter((c) => c.column_id !== currentColumnId)
        return [...otherCards, ...updated]
      })

      reorderCards(
        updated.map((c) => ({ id: c.id, column_id: c.column_id, position: c.position })),
        boardId,
        workspaceId
      )
      return
    }

    // ── Column drag ──
    const isColumnDrag = columns.some((c) => c.id === active.id)
    if (isColumnDrag) {
      const oldIndex = columns.findIndex((c) => c.id === active.id)
      const newIndex = columns.findIndex((c) => c.id === over.id)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      const reordered = arrayMove(columns, oldIndex, newIndex).map((c, i) => ({
        ...c,
        position: i,
      }))
      setColumns(reordered)
      reorderColumns(
        reordered.map((c) => ({ id: c.id, position: c.position })),
        boardId,
        workspaceId
      )
    }
  }

  function onColumnAdded(column: KanbanColumn) {
    setColumns((prev) => [...prev, column])
    setShowAddColumn(false)
  }

  function onColumnDeleted(columnId: string) {
    setColumns((prev) => prev.filter((c) => c.id !== columnId))
    setCards((prev) => prev.filter((c) => c.column_id !== columnId))
  }

  function onColumnRenamed(columnId: string, name: string) {
    setColumns((prev) => prev.map((c) => (c.id === columnId ? { ...c, name } : c)))
  }

  function onCardAdded(card: KanbanCard) {
    setCards((prev) => [...prev, card])
  }

  function onCardUpdated(updated: KanbanCard) {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  function onCardDeleted(cardId: string) {
    setCards((prev) => prev.filter((c) => c.id !== cardId))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 p-6 overflow-x-auto h-full items-start">
        <SortableContext
          items={columns.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              cards={cardsForColumn(column.id)}
              boardId={boardId}
              workspaceId={workspaceId}
              onDeleted={onColumnDeleted}
              onRenamed={onColumnRenamed}
              onCardAdded={onCardAdded}
              onCardUpdated={onCardUpdated}
              onCardDeleted={onCardDeleted}
            />
          ))}
        </SortableContext>

        {/* Add column */}
        <div className="shrink-0 w-72">
          {showAddColumn ? (
            <AddColumnForm
              boardId={boardId}
              workspaceId={workspaceId}
              onAdded={onColumnAdded}
              onCancel={() => setShowAddColumn(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddColumn(true)}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full justify-start gap-2 text-muted-foreground'
              )}
            >
              <Plus className="h-4 w-4" />
              Add column
            </button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeCard && <CardTile card={activeCard} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
