import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const entries = await prisma.passwordEntry.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    res.json({ data: entries })
  } catch {
    res.status(500).json({ message: 'Erro ao listar senhas' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'id inválido' })

    const entry = await prisma.passwordEntry.findUnique({ where: { id } })
    if (!entry) return res.status(404).json({ message: 'Senha não encontrada' })

    res.json({ data: entry })
  } catch {
    res.status(500).json({ message: 'Erro ao buscar senha' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, username, password, url, notes, tags } = req.body as Partial<{
      title: string
      username: string
      password: string
      url: string
      notes: string
      tags: string
    }>

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'title é obrigatório' })
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'password é obrigatório' })
    }

    const created = await prisma.passwordEntry.create({
      data: {
        title: title.trim(),
        username: typeof username === 'string' ? username : '',
        password,
        url: typeof url === 'string' ? url : '',
        notes: typeof notes === 'string' ? notes : '',
        tags: typeof tags === 'string' ? tags : '',
      },
    })

    res.status(201).json({ data: created })
  } catch {
    res.status(500).json({ message: 'Erro ao criar senha' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'id inválido' })

    const { title, username, password, url, notes, tags } = req.body as Partial<{
      title: string
      username: string
      password: string
      url: string
      notes: string
      tags: string
    }>

    const data: any = {}
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'title inválido' })
      data.title = title.trim()
    }
    if (username !== undefined) data.username = typeof username === 'string' ? username : ''
    if (password !== undefined) {
      if (typeof password !== 'string') return res.status(400).json({ message: 'password inválido' })
      data.password = password
    }
    if (url !== undefined) data.url = typeof url === 'string' ? url : ''
    if (notes !== undefined) data.notes = typeof notes === 'string' ? notes : ''
    if (tags !== undefined) data.tags = typeof tags === 'string' ? tags : ''

    const updated = await prisma.passwordEntry.update({ where: { id }, data })
    res.json({ data: updated })
  } catch (err: any) {
    if (String(err?.code) === 'P2025') return res.status(404).json({ message: 'Senha não encontrada' })
    res.status(500).json({ message: 'Erro ao atualizar senha' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'id inválido' })
    await prisma.passwordEntry.delete({ where: { id } })
    res.status(204).send()
  } catch (err: any) {
    if (String(err?.code) === 'P2025') return res.status(404).json({ message: 'Senha não encontrada' })
    res.status(500).json({ message: 'Erro ao deletar senha' })
  }
})

export default router

