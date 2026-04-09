import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { buttonVariants } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KanbanBoard } from '@/components/kanban/kanban-board'

export default async function BoardPage({
  params,
}: {
  params: Promise<{ workspaceId: string; boardId: string }>
}) {
  const { workspaceId, boardId } = await params
  const supabase = await createClient()

  const { data: board } = await supabase
    .from('boards')
    .select('id, name, description')
    .eq('id', boardId)
    .single()

  if (!board) notFound()

  const { data: columns } = await adminClient
    .from('columns')
    .select('id, name, position')
    .eq('board_id', boardId)
    .order('position', { ascending: true })

  const { data: cards } = await adminClient
    .from('cards')
    .select('id, column_id, title, description, position, priority, due_date')
    .in('column_id', (columns ?? []).map((c) => c.id))
    .order('position', { ascending: true })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center gap-4 px-6 py-3 border-b shrink-0">
        <Link
          href={`/workspace/${workspaceId}/boards`}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-semibold">{board.name}</h1>
          {board.description && (
            <p className="text-xs text-muted-foreground">{board.description}</p>
          )}
        </div>
      </header>

      <KanbanBoard
        boardId={boardId}
        workspaceId={workspaceId}
        initialColumns={columns ?? []}
        initialCards={cards ?? []}
      />
    </div>
  )
}
