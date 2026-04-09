export type KanbanCard = {
  id: string
  column_id: string
  title: string
  description: string | null
  position: number
  priority: string | null
  due_date: string | null
}

export type KanbanColumn = {
  id: string
  name: string
  position: number
}
