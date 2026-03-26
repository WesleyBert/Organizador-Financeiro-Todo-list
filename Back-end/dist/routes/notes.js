"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
const IMPORTANCE_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
function parseImportance(value) {
    if (typeof value !== 'string')
        return undefined;
    const v = value.trim().toUpperCase();
    if (!v)
        return undefined;
    if (IMPORTANCE_VALUES.includes(v))
        return v;
    return undefined;
}
function parseQueryText(q) {
    if (typeof q !== 'string')
        return undefined;
    const value = q.trim();
    if (!value)
        return undefined;
    return value;
}
router.get('/', async (req, res) => {
    try {
        const importance = parseImportance(req.query.importance);
        const q = parseQueryText(req.query.q);
        const where = {};
        if (importance)
            where.importance = importance;
        if (q) {
            ;
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
                { tags: { contains: q, mode: 'insensitive' } },
            ];
        }
        const notes = await prisma_1.default.note.findMany({
            where: where,
            orderBy: { updatedAt: 'desc' },
        });
        res.json({ data: notes });
    }
    catch {
        res.status(500).json({ message: 'Erro ao listar notas' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id) || id <= 0) {
            return res.status(400).json({ message: 'id inválido' });
        }
        const note = await prisma_1.default.note.findUnique({ where: { id } });
        if (!note)
            return res.status(404).json({ message: 'Nota não encontrada' });
        res.json({ data: note });
    }
    catch {
        res.status(500).json({ message: 'Erro ao buscar nota' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { title, importance, content, tags } = req.body;
        if (!title || typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({ message: 'title é obrigatório' });
        }
        if (typeof content !== 'string') {
            return res.status(400).json({ message: 'content inválido' });
        }
        const imp = parseImportance(importance) ?? 'MEDIUM';
        const created = await prisma_1.default.note.create({
            data: {
                title: title.trim(),
                importance: imp,
                content,
                tags: typeof tags === 'string' ? tags : '',
            },
        });
        res.status(201).json({ data: created });
    }
    catch {
        res.status(500).json({ message: 'Erro ao criar nota' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id) || id <= 0) {
            return res.status(400).json({ message: 'id inválido' });
        }
        const { title, importance, content, tags } = req.body;
        const data = {};
        if (title !== undefined) {
            if (typeof title !== 'string' || !title.trim()) {
                return res.status(400).json({ message: 'title inválido' });
            }
            data.title = title.trim();
        }
        if (importance !== undefined) {
            const imp = parseImportance(importance);
            if (!imp)
                return res.status(400).json({ message: 'importance inválido' });
            data.importance = imp;
        }
        if (content !== undefined) {
            if (typeof content !== 'string')
                return res.status(400).json({ message: 'content inválido' });
            data.content = content;
        }
        if (tags !== undefined) {
            if (typeof tags !== 'string')
                return res.status(400).json({ message: 'tags inválidas' });
            data.tags = tags;
        }
        const updated = await prisma_1.default.note.update({
            where: { id },
            data,
        });
        res.json({ data: updated });
    }
    catch (err) {
        if (String(err?.code) === 'P2025') {
            return res.status(404).json({ message: 'Nota não encontrada' });
        }
        res.status(500).json({ message: 'Erro ao atualizar nota' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id) || id <= 0) {
            return res.status(400).json({ message: 'id inválido' });
        }
        await prisma_1.default.note.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        if (String(err?.code) === 'P2025') {
            return res.status(404).json({ message: 'Nota não encontrada' });
        }
        res.status(500).json({ message: 'Erro ao deletar nota' });
    }
});
exports.default = router;
