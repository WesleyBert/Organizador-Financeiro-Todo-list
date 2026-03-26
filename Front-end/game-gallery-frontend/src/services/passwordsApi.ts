import { getApiBaseUrl } from '@/apiBase'
import type { PasswordEntry } from '@/types/passwords'

function getApiUrl() {
  return getApiBaseUrl()
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiUrl()
  const res = await fetch(`${base}${path}`, init)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${text}`.trim())
  }

  return (await res.json()) as T
}

export async function listPasswords() {
  const json = await apiFetch<{ data: PasswordEntry[] }>(`/api/passwords`)
  return json.data
}

export async function getPassword(id: number) {
  const json = await apiFetch<{ data: PasswordEntry }>(`/api/passwords/${id}`)
  return json.data
}

export async function createPassword(payload: {
  title: string
  username: string
  password: string
  url: string
  notes: string
  tags: string
}) {
  const json = await apiFetch<{ data: PasswordEntry }>(`/api/passwords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data
}

export async function updatePassword(
  id: number,
  payload: Partial<{
    title: string
    username: string
    password: string
    url: string
    notes: string
    tags: string
  }>,
) {
  const json = await apiFetch<{ data: PasswordEntry }>(`/api/passwords/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data
}

export async function deletePassword(id: number) {
  await apiFetch(`/api/passwords/${id}`, { method: 'DELETE' })
}

