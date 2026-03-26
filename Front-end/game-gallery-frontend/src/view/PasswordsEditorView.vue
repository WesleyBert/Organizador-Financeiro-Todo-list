<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-extrabold text-cyan-200 drop-shadow-[0_0_22px_rgba(34,211,238,0.35)]">
          {{ isEdit ? 'Editar senha' : 'Nova senha' }}
        </h1>
        <p class="text-gray-400 mt-1">Preencha os campos e salve.</p>
      </div>

      <div class="flex gap-3">
        <button
          @click="goBack"
          class="bg-white/5 hover:bg-white/10 text-slate-100 font-bold px-4 py-2 rounded-xl transition-colors border border-white/10"
        >
          Voltar
        </button>
        <button
          @click="handleSave"
          :disabled="saving"
          class="bg-gradient-to-r from-emerald-500/90 to-green-600/90 hover:from-emerald-400 hover:to-green-500 text-white font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-60 shadow-[0_0_22px_rgba(16,185,129,0.25)] border border-emerald-400/20"
        >
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white/5 rounded-2xl shadow-sm p-4 border border-white/10 backdrop-blur">
        <label class="text-sm font-semibold text-slate-200">Titulo</label>
        <input
          v-model="title"
          type="text"
          class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 mt-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
        />

        <label class="text-sm font-semibold text-slate-200 mt-4 block">Usuario</label>
        <input
          v-model="username"
          type="text"
          class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 mt-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          placeholder="Opcional"
        />

        <label class="text-sm font-semibold text-slate-200 mt-4 block">Senha</label>
        <input
          v-model="password"
          type="password"
          class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 mt-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 font-mono text-sm"
        />

        <label class="text-sm font-semibold text-slate-200 mt-4 block">URL</label>
        <input
          v-model="url"
          type="text"
          class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 mt-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          placeholder="https://..."
        />

        <label class="text-sm font-semibold text-slate-200 mt-4 block">Tags (separe por virgula)</label>
        <input
          v-model="tags"
          type="text"
          class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 mt-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          placeholder="Ex: banco, github"
        />

        <label class="text-sm font-semibold text-slate-200 mt-4 block">Notas (texto livre)</label>
        <textarea
          v-model="notes"
          rows="10"
          class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 mt-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 font-mono text-sm"
          placeholder="Observacoes..."
        />
      </div>

      <div class="bg-white/5 rounded-2xl shadow-sm p-4 border border-white/10 backdrop-blur">
        <h2 class="text-lg font-bold text-slate-100 mb-3">Resumo</h2>
        <div class="text-sm text-gray-400 space-y-2">
          <div><span class="text-gray-500">Titulo:</span> {{ title || '-' }}</div>
          <div><span class="text-gray-500">Usuario:</span> {{ username || '-' }}</div>
          <div><span class="text-gray-500">URL:</span> {{ url || '-' }}</div>
          <div><span class="text-gray-500">Tags:</span> {{ tags || '-' }}</div>
          <div class="pt-3">
            <div class="text-xs text-gray-500 mb-1">Senha (nao sera exibida inteira aqui)</div>
            <div class="bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm text-slate-100">
              {{ mask(password) }}
            </div>
          </div>
        </div>

        <div v-if="error" class="mt-4 text-red-400 font-semibold">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { createPassword, getPassword, updatePassword } from '@/services/passwordsApi'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const error = ref<string | null>(null)

const title = ref('')
const username = ref('')
const password = ref('')
const url = ref('')
const tags = ref('')
const notes = ref('')

const id = computed(() => {
  const raw = route.params.id
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
})

const isEdit = computed(() => id.value !== null)

function mask(p: string) {
  const len = (p || '').length
  if (!len) return '-'
  return '•'.repeat(Math.min(len, 12)) + (len > 12 ? '…' : '')
}

function goBack() {
  router.push('/passwords')
}

async function loadIfEdit() {
  if (!id.value) return
  const entry = await getPassword(id.value)
  title.value = entry.title
  username.value = entry.username
  password.value = entry.password
  url.value = entry.url
  tags.value = entry.tags
  notes.value = entry.notes
}

async function handleSave() {
  error.value = null

  if (!title.value.trim()) {
    error.value = 'Titulo obrigatorio.'
    return
  }
  if (!password.value.trim()) {
    error.value = 'Senha obrigatoria.'
    return
  }

  saving.value = true
  try {
    const payload = {
      title: title.value.trim(),
      username: username.value.trim(),
      password: password.value,
      url: url.value.trim(),
      tags: tags.value.trim(),
      notes: notes.value,
    }

    if (isEdit.value && id.value) {
      await updatePassword(id.value, payload)
    } else {
      await createPassword(payload)
    }

    router.push('/passwords')
  } catch (err: any) {
    error.value = err?.message || 'Erro ao salvar'
  } finally {
    saving.value = false
  }
}

onMounted(loadIfEdit)
</script>

