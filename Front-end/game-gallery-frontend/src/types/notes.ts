export type NoteImportance = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Note {
  id: number
  title: string
  importance: NoteImportance
  content: string
  tags: string
  createdAt: string
  updatedAt: string
}

export const IMPORTANCE_LABELS: Record<NoteImportance, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}
