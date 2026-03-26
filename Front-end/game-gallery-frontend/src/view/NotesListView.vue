<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-extrabold text-cyan-200 drop-shadow-[0_0_22px_rgba(34,211,238,0.35)]">
          Lembretes
        </h1>
        <p class="text-gray-400 mt-1 max-w-xl">
          Anote compras na feira, tarefas do dia e qualquer coisa que não possa esquecer. Busque por título, texto ou tags.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <select
          v-model="importanceFilter"
          class="w-full sm:w-44 bg-slate-900/70 border border-white/15 rounded-2xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400/35"
          @change="fetchNotes"
        >
          <option value="">Todas as importâncias</option>
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
          <option value="URGENT">Urgente</option>
        </select>
        <input
          v-model="q"
          type="text"
          placeholder="Buscar..."
          class="w-full sm:w-72 bg-slate-900/70 border border-white/15 rounded-2xl px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/35 focus:border-teal-400/30 shadow-inner"
          @keyup.enter="fetchNotes"
        />
        <button
          type="button"
          @click="fetchNotes"
          class="inline-flex items-center justify-center font-semibold px-5 py-2.5 rounded-2xl text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 border border-teal-400/30 shadow-[0_0_28px_rgba(45,212,191,0.25)] transition-all active:scale-[0.98]"
        >
          Buscar
        </button>
      </div>
    </div>

    <div class="flex flex-wrap justify-end mb-4 gap-3">
      <RouterLink
        to="/notes/new"
        class="inline-flex items-center justify-center font-semibold px-5 py-2.5 rounded-2xl text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-400 hover:to-fuchsia-500 border border-fuchsia-400/35 shadow-[0_0_28px_rgba(192,132,252,0.22)] transition-all active:scale-[0.98]"
      >
        Novo lembrete
      </RouterLink>
    </div>

    <div
      v-if="showSavedBanner"
      class="mb-4 rounded-xl border border-emerald-400/35 bg-emerald-950/40 px-4 py-3 text-emerald-100 flex flex-wrap items-center justify-between gap-3"
      role="status"
    >
      <span class="font-semibold">Lembrete salvo com sucesso.</span>
      <button
        type="button"
        class="text-sm font-semibold text-emerald-200/90 hover:text-white underline underline-offset-2"
        @click="showSavedBanner = false"
      >
        Fechar
      </button>
    </div>

    <div v-if="loading" class="text-gray-400">Carregando...</div>
    <div v-else-if="error" class="text-red-400 font-semibold">{{ error }}</div>

    <div v-else-if="notes.length === 0" class="text-center text-gray-400 py-16">
      Nenhum lembrete encontrado.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <article
        v-for="note in notes"
        :key="note.id"
        class="bg-white/5 rounded-2xl shadow-sm border border-white/10 backdrop-blur p-5 hover:bg-white/7 transition-colors flex flex-col"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span :class="importanceBadgeClass(note.importance)">
                {{ importanceLabel(note.importance) }}
              </span>
            </div>
            <h2 class="text-xl font-bold text-slate-100">{{ note.title }}</h2>
          </div>
          <button
            type="button"
            class="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/12 transition-colors"
            :aria-expanded="isExpanded(note.id)"
            @click="toggleExpand(note)"
          >
            <span>{{ isExpanded(note.id) ? 'Recolher' : 'Expandir' }}</span>
            <span class="text-xs opacity-80" aria-hidden="true">{{ isExpanded(note.id) ? '▲' : '▼' }}</span>
          </button>
        </div>

        <div v-show="!isExpanded(note.id)" class="mt-3">
          <p class="text-gray-400 whitespace-pre-wrap text-sm line-clamp-4">
            {{ snippet(note.content) }}
          </p>
        </div>

        <div
          v-show="isExpanded(note.id)"
          class="mt-4 md-preview max-w-none text-sm border-t border-white/10 pt-4"
        >
          <p v-if="!(note.content || '').trim()" class="text-gray-500">Nenhum conteúdo adicional neste lembrete.</p>
          <div v-else-if="bodyHtmlCache[note.id]" v-html="bodyHtmlCache[note.id]" />
          <p v-else class="text-gray-500 text-sm">Carregando conteúdo…</p>
        </div>

        <div class="flex flex-wrap gap-2 mt-3">
          <span
            v-for="tag in normalizeTags(note.tags)"
            :key="tag"
            class="text-xs bg-cyan-500/10 text-cyan-200 px-2 py-1 rounded-full border border-cyan-400/20"
          >
            {{ tag }}
          </span>
          <span v-if="normalizeTags(note.tags).length === 0" class="text-xs text-gray-500">Sem tags</span>
        </div>

        <p class="text-xs text-gray-500 mt-3">Atualizado: {{ formatDate(note.updatedAt) }}</p>

        <div class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/10">
          <RouterLink
            :to="`/notes/${note.id}`"
            class="inline-flex items-center justify-center font-semibold px-3 py-2 rounded-xl text-center text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 border border-teal-400/25 shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all active:scale-[0.98]"
          >
            Página do lembrete
          </RouterLink>
          <RouterLink
            :to="`/notes/edit/${note.id}`"
            class="inline-flex items-center justify-center font-semibold px-3 py-2 rounded-xl text-center text-slate-100 bg-white/[0.07] hover:bg-white/12 border border-white/15 transition-all active:scale-[0.98]"
          >
            Editar
          </RouterLink>
          <button
            type="button"
            @click="handleDelete(note.id)"
            class="inline-flex items-center justify-center font-semibold px-3 py-2 rounded-xl text-center text-white bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 border border-red-400/25 transition-all active:scale-[0.98]"
          >
            Excluir
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import type { Note, NoteImportance } from '@/types/notes'
import { IMPORTANCE_LABELS } from '@/types/notes'
import { deleteNote, listNotes } from '@/services/notesApi'

const route = useRoute()
const router = useRouter()

const notes = ref<Note[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const q = ref('')
const importanceFilter = ref<string>('')
const expandedIds = ref<number[]>([])
const bodyHtmlCache = ref<Record<number, string>>({})
const showSavedBanner = ref(false)

function importanceLabel(imp: NoteImportance) {
  return IMPORTANCE_LABELS[imp] || imp
}

function importanceBadgeClass(imp: NoteImportance) {
  const base = 'text-xs font-semibold px-2 py-0.5 rounded-full border'
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

function snippet(text: string) {
  const raw = (text || '').trim()
  if (!raw) return 'Sem conteúdo adicional — clique em Expandir ou edite para adicionar.'
  const s = raw.replace(/\s+/g, ' ')
  return s.length > 120 ? `${s.slice(0, 120)}…` : s
}

function isExpanded(id: number) {
  return expandedIds.value.includes(id)
}

async function toggleExpand(note: Note) {
  const id = note.id
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) {
    expandedIds.value = expandedIds.value.filter(x => x !== id)
    return
  }
  expandedIds.value = [...expandedIds.value, id]
  if (!bodyHtmlCache.value[id]) {
    const html = await marked.parse(note.content || '')
    bodyHtmlCache.value = {
      ...bodyHtmlCache.value,
      [id]: DOMPurify.sanitize(String(html)),
    }
  }
}

function normalizeTags(tags: string) {
  return (tags || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleString()
}

async function fetchNotes() {
  loading.value = true
  error.value = null
  try {
    const imp = importanceFilter.value as NoteImportance | ''
    notes.value = await listNotes({
      importance: imp === '' ? undefined : imp,
      q: q.value,
    })
    expandedIds.value = []
    bodyHtmlCache.value = {}
  } catch (err: any) {
    error.value = err?.message || 'Erro ao buscar lembretes'
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  const ok = confirm('Excluir este lembrete?')
  if (!ok) return

  try {
    await deleteNote(id)
    await fetchNotes()
  } catch (err: any) {
    alert(err?.message || 'Erro ao excluir')
  }
}

onMounted(() => {
  if (route.query.saved === '1') {
    showSavedBanner.value = true
    router.replace({ path: '/notes', query: {} })
  }
  fetchNotes()
})
</script>
