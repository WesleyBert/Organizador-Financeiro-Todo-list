export interface TodoCategory {
  id: number
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface TodoItem {
  id: number
  categoryId: number
  text: string
  done: boolean
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

