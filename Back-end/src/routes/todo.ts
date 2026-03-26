import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.todoCategory.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json({ data: categories })
  } catch {
    res.status(500).json({ message: 'Erro ao listar categorias' })
  }
})

router.post('/categories', async (req, res) => {
  try {
    const { name, color } = req.body as { name?: string; color?: string }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'name é obrigatório' })
    }

    const created = await prisma.todoCategory.create({
      data: {
        name: name.trim(),
        color: typeof color === 'string' && color.trim() ? color.trim() : '#22d3ee',
      },
    })
    res.status(201).json({ data: created })
  } catch {
    res.status(500).json({ message: 'Erro ao criar categoria' })
  }
})

router.put('/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'id inválido' })

    const { name, color } = req.body as { name?: string; color?: string }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'name é obrigatório' })
    }

    const updated = await prisma.todoCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        color: typeof color === 'string' && color.trim() ? color.trim() : '#22d3ee',
      },
    })
    res.json({ data: updated })
  } catch (err: any) {
    if (String(err?.code) === 'P2025') return res.status(404).json({ message: 'Categoria não encontrada' })
    res.status(500).json({ message: 'Erro ao atualizar categoria' })
  }
})

router.delete('/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'id inválido' })
    await prisma.todoCategory.delete({ where: { id } })
    res.status(204).send()
  } catch (err: any) {
    if (String(err?.code) === 'P2025') return res.status(404).json({ message: 'Categoria não encontrada' })
    res.status(500).json({ message: 'Erro ao deletar categoria' })
  }
})

router.get('/items', async (req, res) => {
  try {
    const categoryId = Number(req.query.categoryId)
    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      return res.status(400).json({ message: 'categoryId inválido' })
    }

    const items = await prisma.todoItem.findMany({
      where: { categoryId },
      orderBy: [{ done: 'asc' }, { createdAt: 'desc' }],
    })

    res.json({ data: items })
  } catch {
    res.status(500).json({ message: 'Erro ao listar itens' })
  }
})

router.post('/items', async (req, res) => {
  try {
    const { categoryId, text, dueDate } = req.body as {
      categoryId?: number
      text?: string
      dueDate?: string
    }

    if (!categoryId || !Number.isFinite(Number(categoryId))) {
      return res.status(400).json({ message: 'categoryId é obrigatório' })
    }
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'text é obrigatório' })
    }

    const created = await prisma.todoItem.create({
      data: {
        categoryId: Number(categoryId),
        text: text.trim(),
        dueDate: typeof dueDate === 'string' && dueDate.trim() ? new Date(dueDate) : null,
      },
    })

    res.status(201).json({ data: created })
  } catch {
    res.status(500).json({ message: 'Erro ao criar item' })
  }
})

router.put('/items/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'id inválido' })

    const { text, done, dueDate } = req.body as {
      text?: string
      done?: boolean
      dueDate?: string | null
    }

    const data: any = {}
    if (text !== undefined) {
      if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ message: 'text inválido' })
      data.text = text.trim()
    }
    if (done !== undefined) {
      if (typeof done !== 'boolean') return res.status(400).json({ message: 'done inválido' })
      data.done = done
    }
    if (dueDate !== undefined) {
      if (dueDate === null) data.dueDate = null
      else if (typeof dueDate === 'string' && dueDate.trim()) data.dueDate = new Date(dueDate)
      else return res.status(400).json({ message: 'dueDate inválida' })
    }

    const updated = await prisma.todoItem.update({ where: { id }, data })
    res.json({ data: updated })
  } catch (err: any) {
    if (String(err?.code) === 'P2025') return res.status(404).json({ message: 'Item não encontrado' })
    res.status(500).json({ message: 'Erro ao atualizar item' })
  }
})

router.delete('/items/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'id inválido' })
    await prisma.todoItem.delete({ where: { id } })
    res.status(204).send()
  } catch (err: any) {
    if (String(err?.code) === 'P2025') return res.status(404).json({ message: 'Item não encontrado' })
    res.status(500).json({ message: 'Erro ao deletar item' })
  }
})

export default router

