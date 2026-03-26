import { Router } from 'express'
import type { BillPaymentStatus } from '@prisma/client'
import prisma from '../lib/prisma'

const router = Router()

const PAYMENT_STATUSES: BillPaymentStatus[] = ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE']

function parsePaymentStatus(value: unknown): BillPaymentStatus | undefined {
  if (typeof value !== 'string') return undefined
  const v = value.trim().toUpperCase()
  if (PAYMENT_STATUSES.includes(v as BillPaymentStatus)) return v as BillPaymentStatus
  return undefined
}

function parseInstallmentCount(value: unknown): number | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const n = typeof value === 'number' ? value : parseInt(String(value), 10)
  if (!Number.isFinite(n) || n < 1) return undefined
  return n
}

router.get('/bills', async (_req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      orderBy: [{ nextDueDate: 'asc' }, { updatedAt: 'desc' }],
    })
    res.json({ data: bills })
  } catch {
    res.status(500).json({ message: 'Erro ao listar contas' })
  }
})

router.delete('/bills', async (_req, res) => {
  try {
    await prisma.bill.deleteMany({})
    res.status(204).send()
  } catch {
    res.status(500).json({ message: 'Erro ao limpar contas' })
  }
})

function parseRecurrence(value: unknown): 'NONE' | 'MONTHLY' | 'YEARLY' | null {
  if (value === 'NONE' || value === 'MONTHLY' || value === 'YEARLY') return value
  return null
}

router.put('/bills/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'id inválido' })

    const { title, amount, dueDate, recurrence, installmentCount, paymentStatus } = req.body as {
      title?: string
      amount?: number | string
      dueDate?: string
      recurrence?: 'NONE' | 'MONTHLY' | 'YEARLY'
      installmentCount?: unknown
      paymentStatus?: unknown
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'title é obrigatório' })
    }
    if (amount === undefined) return res.status(400).json({ message: 'amount é obrigatório' })
    const amountNumber = typeof amount === 'number' ? amount : Number(amount)
    if (!Number.isFinite(amountNumber) || amountNumber < 0) {
      return res.status(400).json({ message: 'amount inválido' })
    }
    if (!dueDate || typeof dueDate !== 'string') return res.status(400).json({ message: 'dueDate é obrigatório' })

    const parsedDue = new Date(dueDate)
    if (Number.isNaN(parsedDue.getTime())) return res.status(400).json({ message: 'dueDate inválida' })

    const normalizedRecurrence = parseRecurrence(recurrence)
    if (!normalizedRecurrence) return res.status(400).json({ message: 'recurrence inválida' })

    const inst = parseInstallmentCount(installmentCount)
    if (inst === undefined && installmentCount !== undefined && installmentCount !== null && installmentCount !== '') {
      return res.status(400).json({ message: 'installmentCount inválido' })
    }

    const paySt = parsePaymentStatus(paymentStatus) ?? 'PENDING'

    const updated = await prisma.bill.update({
      where: { id },
      data: {
        title: title.trim(),
        amount: amountNumber,
        currency: 'BRL',
        dueDate: parsedDue,
        nextDueDate: parsedDue,
        recurrence: normalizedRecurrence,
        ...(inst !== undefined ? { installmentCount: inst } : {}),
        paymentStatus: paySt,
      },
    })

    res.json({ data: updated })
  } catch (err: any) {
    if (String(err?.code) === 'P2025') return res.status(404).json({ message: 'Conta não encontrada' })
    res.status(500).json({ message: 'Erro ao atualizar conta' })
  }
})

router.post('/bills', async (req, res) => {
  try {
    const { title, amount, dueDate, recurrence, installmentCount, paymentStatus } = req.body as {
      title?: string
      amount?: number | string
      dueDate?: string
      recurrence?: 'NONE' | 'MONTHLY' | 'YEARLY'
      installmentCount?: unknown
      paymentStatus?: unknown
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'title é obrigatório' })
    }
    if (amount === undefined) return res.status(400).json({ message: 'amount é obrigatório' })
    const amountNumber = typeof amount === 'number' ? amount : Number(amount)
    if (!Number.isFinite(amountNumber) || amountNumber < 0) {
      return res.status(400).json({ message: 'amount inválido' })
    }
    if (!dueDate || typeof dueDate !== 'string') return res.status(400).json({ message: 'dueDate é obrigatório' })

    const parsedDue = new Date(dueDate)
    if (Number.isNaN(parsedDue.getTime())) return res.status(400).json({ message: 'dueDate inválida' })

    const normalizedRecurrence = parseRecurrence(recurrence ?? 'NONE') ?? 'NONE'

    const inst = parseInstallmentCount(installmentCount)
    if (inst === undefined && installmentCount !== undefined && installmentCount !== null && installmentCount !== '') {
      return res.status(400).json({ message: 'installmentCount inválido' })
    }

    const paySt = parsePaymentStatus(paymentStatus) ?? 'PENDING'

    // Inicializa a próxima data de vencimento = primeiro vencimento.
    const created = await prisma.bill.create({
      data: {
        title: title.trim(),
        amount: amountNumber,
        currency: 'BRL',
        dueDate: parsedDue,
        nextDueDate: parsedDue,
        recurrence: normalizedRecurrence,
        lastPaidAt: null,
        installmentCount: inst !== undefined ? inst : null,
        paymentStatus: paySt,
      },
    })

    res.status(201).json({ data: created })
  } catch {
    res.status(500).json({ message: 'Erro ao criar conta' })
  }
})

function daysInMonth(year: number, monthIndex0: number) {
  // monthIndex0: 0-11
  return new Date(year, monthIndex0 + 1, 0).getDate()
}

function addMonthsClamped(date: Date, months: number) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const targetMonthIndex = month + months
  const targetYear = year + Math.floor(targetMonthIndex / 12)
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12
  const maxDay = daysInMonth(targetYear, targetMonth)
  const newDay = Math.min(day, maxDay)
  return new Date(targetYear, targetMonth, newDay, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
}

function addYearsClamped(date: Date, years: number) {
  const target = new Date(date)
  target.setFullYear(target.getFullYear() + years)
  // Se o dia ficou inválido (ex.: 29/02), ajusta para o último dia do mês.
  const maxDay = daysInMonth(target.getFullYear(), target.getMonth())
  if (date.getDate() > maxDay) {
    target.setDate(maxDay)
  }
  return target
}

function computeNextDue(billDueDate: Date, recurrence: 'NONE' | 'MONTHLY' | 'YEARLY') {
  if (recurrence === 'NONE') return null
  if (recurrence === 'MONTHLY') return addMonthsClamped(billDueDate, 1)
  return addYearsClamped(billDueDate, 1)
}

router.post('/bills/:id/pay', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'id inválido' })

    const bill = await prisma.bill.findUnique({ where: { id } })
    if (!bill) return res.status(404).json({ message: 'Conta não encontrada' })
    if (!bill.nextDueDate) return res.status(400).json({ message: 'Esta conta não tem vencimento pendente' })

    const recurrence = bill.recurrence as 'NONE' | 'MONTHLY' | 'YEARLY'

    const nextDue = computeNextDue(bill.nextDueDate, recurrence)
    const updated = await prisma.bill.update({
      where: { id },
      data: {
        lastPaidAt: new Date(),
        nextDueDate: nextDue,
        paymentStatus: 'PENDING',
      },
    })

    res.json({ data: updated })
  } catch {
    res.status(500).json({ message: 'Erro ao marcar como paga' })
  }
})

router.delete('/bills/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'id inválido' })
    await prisma.bill.delete({ where: { id } })
    res.status(204).send()
  } catch (err: any) {
    if (String(err?.code) === 'P2025') return res.status(404).json({ message: 'Conta não encontrada' })
    res.status(500).json({ message: 'Erro ao deletar conta' })
  }
})

router.get('/finance/summary', async (req, res) => {
  try {
    const month = req.query.month
    if (typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'month inválido. Use YYYY-MM' })
    }

    const [yStr, mStr] = month.split('-')
    const year = Number(yStr)
    const monthIndex = Number(mStr) - 1

    const start = new Date(year, monthIndex, 1, 0, 0, 0, 0)
    const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)

    const billsInMonth = await prisma.bill.findMany({
      where: { nextDueDate: { gte: start, lte: end } },
      orderBy: { nextDueDate: 'asc' },
    })

    const pendingNotPaid = await prisma.bill.findMany({
      where: { paymentStatus: { not: 'PAID' } },
    })

    const totalMonth = billsInMonth
      .filter(b => b.paymentStatus !== 'PAID')
      .reduce((acc, b) => acc + Number(b.amount), 0)

    const totalGeral = pendingNotPaid.reduce((acc, b) => acc + Number(b.amount), 0)

    res.json({
      data: {
        month,
        total: totalGeral,
        totalMonth,
        currency: 'BRL',
        bills: billsInMonth,
        allPending: pendingNotPaid,
      },
    })
  } catch {
    res.status(500).json({ message: 'Erro ao calcular resumo' })
  }
})

export default router

