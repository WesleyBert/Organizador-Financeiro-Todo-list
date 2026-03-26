import { getApiBaseUrl } from '@/apiBase'
import type { Note, NoteImportance } from '@/types/notes'

function getApiUrl() {
  return getApiBaseUrl()
}

function parseJsonMessage(text: string): string | null {
  try {
    const j = JSON.parse(text) as { message?: unknown }
    if (j && typeof j.message === 'string' && j.message.trim()) return j.message.trim()
  } catch {
    /* não é JSON */
  }
  return null
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiUrl()
  let res: Response
  try {
    res = await fetch(`${base}${path}`, init)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    const isNetwork =
      /failed to fetch|networkerror|load failed|aborted|conexão|connection/i.test(msg) ||
      (typeof navigator !== 'undefined' && !navigator.onLine)
    throw new Error(
      isNetwork
        ? 'Não foi possível conectar ao servidor. Confira se o back-end está em execução e se VITE_API_URL está correto (ex.: http://localhost:3001).'
        : msg || 'Erro de rede',
    )
  }

  const text = await res.text().catch(() => '')

  if (!res.ok) {
    const apiMsg = parseJsonMessage(text)
    throw new Error(apiMsg || `Erro HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ''}`)
  }

  if (!text.trim()) {
    return undefined as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('Resposta inválida do servidor (não é JSON).')
  }
}

export async function listNotes(params: { importance?: NoteImportance; q?: string } = {}) {
  const searchParams = new URLSearchParams()
  if (params.importance) searchParams.set('importance', params.importance)
  if (params.q && params.q.trim()) searchParams.set('q', params.q.trim())

  const query = searchParams.toString()
  const path = `/api/notes${query ? `?${query}` : ''}`

  const json = await apiFetch<{ data: Note[] }>(path)
  return json.data
}

export async function getNote(id: number) {
  const json = await apiFetch<{ data: Note }>(`/api/notes/${id}`)
  return json.data
}

export async function createNote(payload: {
  title: string
  importance: NoteImportance
  content: string
  tags: string
}) {
  const json = await apiFetch<{ data: Note }>(`/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data
}

export async function updateNote(
  id: number,
  payload: Partial<{ title: string; importance: NoteImportance; content: string; tags: string }>,
) {
  const json = await apiFetch<{ data: Note }>(`/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data
}

export async function deleteNote(id: number) {
  await apiFetch(`/api/notes/${id}`, { method: 'DELETE' })
}
