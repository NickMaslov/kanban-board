'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CardTile } from './card-tile'
import { CardDetailDialog } from './card-detail-dialog'
import type { KanbanCard } from './types'

type Props = {
  card: KanbanCard
  boardId: string
  workspaceId: string
  onUpdated: (card: KanbanCard) => void
  onDeleted: (cardId: string) => void
}

export function SortableCard({ card, boardId, workspaceId, onUpdated, onDeleted }: Props) {
  const [detailOpen, setDetailOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <CardTile
          card={card}
          isDragging={isDragging}
          onClick={() => !isDragging && setDetailOpen(true)}
        />
      </div>

      <CardDetailDialog
        card={card}
        boardId={boardId}
        workspaceId={workspaceId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdated={onUpdated}
        onDeleted={onDeleted}
      />
    </>
  )
}
