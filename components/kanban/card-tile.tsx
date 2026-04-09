'use client'

import { Calendar, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { KanbanCard } from './types'

const priorityConfig = {
  urgent: { label: 'Urgent', class: 'bg-red-500/20 text-red-600 dark:text-red-400' },
  high:   { label: 'High',   class: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
  medium: { label: 'Medium', class: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' },
  low:    { label: 'Low',    class: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
}

type Props = {
  card: KanbanCard
  isDragging?: boolean
  onClick?: () => void
}

export function CardTile({ card, isDragging, onClick }: Props) {
  const priority = card.priority ? priorityConfig[card.priority as keyof typeof priorityConfig] : null
  const isOverdue = card.due_date && new Date(card.due_date) < new Date()

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card border rounded-lg p-3 cursor-pointer select-none space-y-2',
        'hover:border-ring/50 transition-colors',
        isDragging && 'opacity-50 rotate-2 shadow-lg',
        onClick && 'hover:shadow-sm'
      )}
    >
      <p className="text-sm font-medium leading-snug">{card.title}</p>

      {card.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
      )}

      {(priority || card.due_date) && (
        <div className="flex items-center gap-2 flex-wrap">
          {priority && (
            <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', priority.class)}>
              {priority.label}
            </span>
          )}
          {card.due_date && (
            <span className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}>
              <Calendar className="h-3 w-3" />
              {new Date(card.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
