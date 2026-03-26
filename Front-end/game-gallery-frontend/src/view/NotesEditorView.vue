<template>
  <div class="max-w-5xl mx-auto relative">
    <div
      v-if="saving"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        class="flex flex-col items-center gap-4 rounded-2xl border border-cyan-400/25 bg-slate-900/95 px-10 py-8 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
      >
        <span
          class="inline-block h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300"
          aria-hidden="true"
        />
        <p class="text-slate-100 font-semibold">Salvando lembrete…</p>
        <p class="text-sm text-slate-400 text-center max-w-xs">Gravando no banco de dados. Aguarde um instante.</p>
      </div>
    </div>

    <div
      v-if="error"
      class="mb-4 rounded-xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-red-200 font-semibold"
      role="alert"
    >
      {{ error }}
    </div>

    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-extrabold text-cyan-200 drop-shadow-[0_0_22px_rgba(34,211,238,0.35)]">
          {{ isEdit ? 'Editar lembrete' : 'Novo lembrete' }}
        </h1>
        <p class="text-gray-400 mt-1">
          Use para compras na feira, compromissos e qualquer informação que precise lembrar. O conteúdo aceita texto livre (Markdown opcional no preview).
        </p>
      </div>

      <div class="flex gap-3 shrink-0">
        <button
          type="button"
          @click="goBack"
          class="bg-white/5 hover:bg-white/10 text-slate-100 font-bold px-4 py-2 rounded-xl transition-colors border border-white/10"
        >
          Voltar
        </button>
        <button
          type="button"
          @click="handleSave"
          :disabled="saving"
          class="bg-gradient-to-r from-emerald-500/90 to-green-600/90 hover:from-emerald-400 hover:to-green-500 text-white font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-wait shadow-[0_0_22px_rgba(16,185,129,0.25)] border border-emerald-400/20"
        >
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white/5 rounded-2xl shadow-sm p-4 border border-white/10 backdrop-blur space-y-4">
        <div>
          <label class="text-sm font-semibold text-slate-200">Título do lembrete</label>
          <input
            v-model="title"
            type="text"
            class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 mt-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            placeholder="Ex: Compras na feira"
          />
        </div>

        <div>
          <label class="text-sm font-semibold text-slate-200">Nível de importância</label>
          <select
            v-model="importance"
            class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 mt-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          >
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>

        <div>
          <label class="text-sm font-semibold text-slate-200">Tags (opcional, separe por vírgula)</label>
          <input
            v-model="tags"
            type="text"
            class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 mt-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            placeholder="Ex: feira, casa"
          />
        </div>

        <div>
          <label class="text-sm font-semibold text-slate-200">Conteúdo</label>
          <p class="text-xs text-gray-500 mt-0.5 mb-1">Opcional. Lista de itens, horários, observações (Markdown no preview).</p>
          <textarea
            v-model="content"
            rows="16"
            class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 mt-1 font-mono text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            placeholder="- tomate&#10;- alface&#10;- ovos"
          />
        </div>
      </div>

      <div class="bg-white/5 rounded-2xl shadow-sm p-4 border border-white/10 backdrop-blur">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-bold text-slate-100">Preview</h2>
          <span v-if="content.trim().length === 0" class="text-sm text-gray-500">Comece a digitar...</span>
        </div>

        <div class="md-preview max-w-none min-h-[200px]">
          <div v-html="previewHtml" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import type { NoteImportance } from '@/types/notes'
import { createNote, getNote, updateNote } from '@/services/notesApi'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const error = ref<string | null>(null)

const title = ref('')
const importance = ref<NoteImportance>('MEDIUM')
const tags = ref('')
const content = ref('')

const id = computed(() => {
  const raw = route.params.id
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
})

const isEdit = computed(() => id.value !== null)

const previewHtml = ref('')

watch(
  content,
  async (md) => {
    const html = await marked.parse(md || '')
    previewHtml.value = DOMPurify.sanitize(String(html))
  },
  { immediate: true },
)

function goBack() {
  router.push('/notes')
}

async function loadIfEdit() {
  if (!id.value) return
  const note = await getNote(id.value)
  title.value = note.title
  importance.value = note.importance
  tags.value = note.tags
  content.value = note.content
}

async function handleSave() {
  error.value = null
  const payload = {
    title: title.value.trim(),
    importance: importance.value,
    tags: tags.value.trim(),
    content: content.value,
  }

  if (!payload.title) {
    error.value = 'Informe o título do lembrete para salvar.'
    return
  }

  saving.value = true
  try {
    if (isEdit.value && id.value) {
      await updateNote(id.value, payload)
    } else {
      await createNote(payload)
    }
    await router.push({ path: '/notes', query: { saved: '1' } })
  } catch (err: any) {
    error.value = err?.message || 'Erro ao salvar lembrete'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await loadIfEdit()
  } catch (err: any) {
    error.value = err?.message || 'Erro ao carregar lembrete'
  }
})
</script>
