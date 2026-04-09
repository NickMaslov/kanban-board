'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createColumn } from '@/app/actions/column'
import type { KanbanColumn } from './types'

type Props = {
  boardId: string
  workspaceId: string
  onAdded: (column: KanbanColumn) => void
  onCancel: () => void
}

export function AddColumnForm({ boardId, workspaceId, onAdded, onCancel }: Props) {
  const [state, action, pending] = useActionState(createColumn, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.column) {
      onAdded(state.column as KanbanColumn)
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <input type="hidden" name="board_id" value={boardId} />
      <input type="hidden" name="workspace_id" value={workspaceId} />
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      <Input name="name" placeholder="Column name" autoFocus onKeyDown={(e) => e.key === 'Escape' && onCancel()} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} className="flex-1">
          {pending ? 'Adding…' : 'Add column'}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
