import { getApiBaseUrl } from '@/apiBase'
import type { Bill, BillPaymentStatus, FinanceSummaryResponse, Recurrence } from '@/types/finance'

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
        ? 'Não foi possível conectar ao servidor. Confira se o back-end está em execução e VITE_API_URL (ex.: http://localhost:3001).'
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

export async function listBills() {
  const json = await apiFetch<{ data: Bill[] }>(`/api/bills`)
  return json.data
}

export async function createBill(payload: {
  title: string
  amount: number
  dueDate: string
  recurrence: Recurrence
  installmentCount?: number | null
  paymentStatus: BillPaymentStatus
}) {
  const json = await apiFetch<{ data: Bill }>(`/api/bills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data
}

export async function updateBill(
  id: number,
  payload: {
    title: string
    amount: number
    dueDate: string
    recurrence: Recurrence
    installmentCount?: number | null
    paymentStatus: BillPaymentStatus
  },
) {
  const json = await apiFetch<{ data: Bill }>(`/api/bills/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data
}

export async function payBill(id: number) {
  const json = await apiFetch<{ data: Bill }>(`/api/bills/${id}/pay`, { method: 'POST' })
  return json.data
}

export async function deleteBill(id: number) {
  await apiFetch(`/api/bills/${id}`, { method: 'DELETE' })
}

export async function deleteAllBills() {
  await apiFetch(`/api/bills`, { method: 'DELETE' })
}

export async function getFinanceSummary(month: string) {
  const json = await apiFetch<{ data: FinanceSummaryResponse }>(
    `/api/finance/summary?month=${encodeURIComponent(month)}`,
  )
  return json.data
}
