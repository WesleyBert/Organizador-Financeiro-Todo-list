export type Recurrence = 'NONE' | 'MONTHLY' | 'YEARLY'

export type BillPaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE'

export interface Bill {
  id: number
  title: string
  amount: number
  currency: string
  dueDate: string
  nextDueDate: string | null
  recurrence: Recurrence
  lastPaidAt: string | null
  installmentCount: number | null
  paymentStatus: BillPaymentStatus
  createdAt: string
  updatedAt: string
}

export interface FinanceSummaryResponse {
  month: string
  /** Soma de todas as contas com status diferente de Pago */
  total: number
  /** Soma das contas com vencimento no mês (e não pagas) */
  totalMonth?: number
  currency: string
  bills: Bill[]
  allPending?: Bill[]
}
