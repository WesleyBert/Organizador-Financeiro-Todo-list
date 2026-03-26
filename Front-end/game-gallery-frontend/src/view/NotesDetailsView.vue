<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <div v-if="note" class="mb-2">
          <span :class="importanceBadgeClass(note.importance)">
            {{ importanceLabel(note.importance) }}
          </span>
        </div>
        <h1 class="text-3xl font-extrabold text-cyan-200 drop-shadow-[0_0_22px_rgba(34,211,238,0.35)]">
          {{ note?.title || 'Carregando...' }}
        </h1>
      </div>

      <div class="flex gap-3 flex-wrap justify-end">
        <RouterLink
          to="/notes"
          class="bg-white/5 hover:bg-white/10 text-slate-100 font-bold px-4 py-2 rounded-xl transition-colors border border-white/10"
        >
          Voltar
        </RouterLink>
        <RouterLink
          v-if="note"
          :to="`/notes/edit/${note.id}`"
          class="bg-white/5 hover:bg-white/10 text-slate-100 font-bold px-4 py-2 rounded-xl transition-colors border border-white/10"
        >
          Editar
        </RouterLink>
        <button
          v-if="note"
          type="button"
          @click="handleDelete"
          class="bg-red-600/90 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition-colors border border-red-400/20"
        >
          Excluir
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-400">Carregando...</div>
    <div v-else-if="error" class="text-red-400 font-semibold">{{ error }}</div>
    <div v-else-if="!note" class="text-gray-400">Lembrete não encontrado.</div>

    <div v-else class="bg-white/5 rounded-2xl shadow-sm border border-white/10 backdrop-blur p-6">
      <div class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in normalizeTags(note.tags)"
          :key="tag"
          class="text-xs bg-cyan-500/10 text-cyan-200 px-2 py-1 rounded-full border border-cyan-400/20"
        >
          {{ tag }}
        </span>
        <span v-if="normalizeTags(note.tags).length === 0" class="text-xs text-gray-500">Sem tags</span>
      </div>

      <div class="text-sm text-gray-500 mb-5">
        Criada: {{ formatDate(note.createdAt) }} | Atualizada: {{ formatDate(note.updatedAt) }}
      </div>

      <div class="md-preview max-w-none">
        <div v-html="previewHtml" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import type { Note, NoteImportance } from '@/types/notes'
import { IMPORTANCE_LABELS } from '@/types/notes'
import { deleteNote, getNote } from '@/services/notesApi'

const route = useRoute()
const router = useRouter()

const note = ref<Note | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const previewHtml = ref('')

function importanceLabel(imp: NoteImportance) {
  return IMPORTANCE_LABELS[imp] || imp
}

function importanceBadgeClass(imp: NoteImportance) {
  const base = 'text-xs font-semibold px-2.5 py-1 rounded-full border'
  switch (imp) {
    case 'URGENT':
      return `${base} bg-red-500/20 text-red-200 border-red-400/40`
    case 'HIGH':
      return `${base} bg-orange-500/20 text-orange-200 border-orange-400/35`
    case 'MEDIUM':
      return `${base} bg-amber-500/15 text-amber-200 border-amber-400/30`
    default:
      return `${base} bg-slate-500/20 text-slate-300 border-white/15`
  }
}

watch(
  () => note.value?.content,
  async (md) => {
    const html = await marked.parse(md || '')
    previewHtml.value = DOMPurify.sanitize(String(html))
  },
  { immediate: true },
)

function normalizeTags(tags: string) {
  return (tags || '').split(',').map(t => t.trim()).filter(Boolean)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleString()
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const idRaw = route.params.id
    const id = Number(idRaw)
    if (!Number.isFinite(id) || id <= 0) throw new Error('id inválido')
    note.value = await getNote(id)
  } catch (err: any) {
    error.value = err?.message || 'Erro ao carregar lembrete'
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!note.value) return
  const ok = confirm('Excluir este lembrete?')
  if (!ok) return

  try {
    await deleteNote(note.value.id)
    router.push('/notes')
  } catch (err: any) {
    alert(err?.message || 'Erro ao excluir')
  }
}

onMounted(load)
</script>
