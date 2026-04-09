import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateBoardDialog } from '@/components/boards/create-board-dialog'
import { BoardCard } from '@/components/boards/board-card'

export default async function BoardsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = await createClient()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('id', workspaceId)
    .single()

  if (!workspace) notFound()

  const { data: boards } = await supabase
    .from('boards')
    .select('id, name, description, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">Boards</p>
        </div>
        <CreateBoardDialog workspaceId={workspaceId} />
      </div>

      {!boards || boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground mb-4">No boards yet. Create one to get started.</p>
          <CreateBoardDialog workspaceId={workspaceId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} workspaceId={workspaceId} />
          ))}
        </div>
      )}
    </div>
  )
}
