import { Router } from 'express'
import prisma from '../lib/prisma'
import type { Importance } from '@prisma/client'

const router = Router()

const IMPORTANCE_VALUES: Importance[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

function parseImportance(value: unknown): Importance | undefined {
  if (typeof value !== 'string') return undefined
  const v = value.trim().toUpperCase()
  if (!v) return undefined
  if (IMPORTANCE_VALUES.includes(v as Importance)) return v as Importance
  return undefined
}

function parseQueryText(q: unknown): string | undefined {
  if (typeof q !== 'string') return undefined
  const value = q.trim()
  if (!value) return undefined
  return value
}

router.get('/', async (req, res) => {
  try {
    const importance = parseImportance(req.query.importance)
    const q = parseQueryText(req.query.q)

    const where: Record<string, unknown> = {}
    if (importance) where.importance = importance

    if (q) {
      ;(where as any).OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { tags: { contains: q, mode: 'insensitive' } },
      ]
    }

    const notes = await prisma.note.findMany({
      where: where as any,
      orderBy: { updatedAt: 'desc' },
    })

    res.json({ data: notes })
  } catch {
    res.status(500).json({ message: 'Erro ao listar notas' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: 'id inválido' })
    }

    const note = await prisma.note.findUnique({ where: { id } })
    if (!note) return res.status(404).json({ message: 'Nota não encontrada' })

    res.json({ data: note })
  } catch {
    res.status(500).json({ message: 'Erro ao buscar nota' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, importance, content, tags } = req.body as {
      title?: string
      importance?: string
      content?: string
      tags?: string
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'title é obrigatório' })
    }
    if (typeof content !== 'string') {
      return res.status(400).json({ message: 'content inválido' })
    }

    const imp = parseImportance(importance) ?? 'MEDIUM'

    const created = await prisma.note.create({
      data: {
        title: title.trim(),
        importance: imp,
        content,
        tags: typeof tags === 'string' ? tags : '',
      },
    })

    res.status(201).json({ data: created })
  } catch {
    res.status(500).json({ message: 'Erro ao criar nota' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: 'id inválido' })
    }

    const { title, importance, content, tags } = req.body as {
      title?: string
      importance?: string
      content?: string
      tags?: string
    }

    const data: any = {}

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'title inválido' })
      }
      data.title = title.trim()
    }
    if (importance !== undefined) {
      const imp = parseImportance(importance)
      if (!imp) return res.status(400).json({ message: 'importance inválido' })
      data.importance = imp
    }
    if (content !== undefined) {
      if (typeof content !== 'string') return res.status(400).json({ message: 'content inválido' })
      data.content = content
    }
    if (tags !== undefined) {
      if (typeof tags !== 'string') return res.status(400).json({ message: 'tags inválidas' })
      data.tags = tags
    }

    const updated = await prisma.note.update({
      where: { id },
      data,
    })

    res.json({ data: updated })
  } catch (err: any) {
    if (String(err?.code) === 'P2025') {
      return res.status(404).json({ message: 'Nota não encontrada' })
    }
    res.status(500).json({ message: 'Erro ao atualizar nota' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: 'id inválido' })
    }

    await prisma.note.delete({ where: { id } })
    res.status(204).send()
  } catch (err: any) {
    if (String(err?.code) === 'P2025') {
      return res.status(404).json({ message: 'Nota não encontrada' })
    }
    res.status(500).json({ message: 'Erro ao deletar nota' })
  }
})

export default router
