import { getApiBaseUrl } from '@/apiBase'
import type { TodoCategory, TodoItem } from '@/types/todo'

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
        ? 'Não foi possível conectar ao servidor. Confira se o back-end está em execução (ex.: http://localhost:3001).'
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

export async function listTodoCategories() {
  const json = await apiFetch<{ data: TodoCategory[] }>(`/api/todo/categories`)
  return json.data
}

export async function createTodoCategory(payload: { name: string; color?: string }) {
  const json = await apiFetch<{ data: TodoCategory }>(`/api/todo/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data
}

export async function updateTodoCategory(id: number, payload: { name: string; color?: string }) {
  const json = await apiFetch<{ data: TodoCategory }>(`/api/todo/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data
}

export async function deleteTodoCategory(id: number) {
  await apiFetch(`/api/todo/categories/${id}`, { method: 'DELETE' })
}

export async function listTodoItems(categoryId: number) {
  const json = await apiFetch<{ data: TodoItem[] }>(`/api/todo/items?categoryId=${categoryId}`)
  return json.data
}

export async function createTodoItem(payload: { categoryId: number; text: string; dueDate?: string | null }) {
  const json = await apiFetch<{ data: TodoItem }>(`/api/todo/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data
}

export async function updateTodoItem(
  id: number,
  payload: Partial<{ text: string; done: boolean; dueDate: string | null }>,
) {
  const json = await apiFetch<{ data: TodoItem }>(`/api/todo/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data
}

export async function deleteTodoItem(id: number) {
  await apiFetch(`/api/todo/items/${id}`, { method: 'DELETE' })
}
