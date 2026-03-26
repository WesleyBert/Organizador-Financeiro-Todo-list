<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-extrabold text-cyan-200 drop-shadow-[0_0_22px_rgba(34,211,238,0.35)]">
          Senhas
        </h1>
        <p class="text-gray-400 mt-1">Armazene credenciais e revele quando precisar.</p>
      </div>

      <RouterLink
        to="/passwords/new"
        class="bg-gradient-to-r from-fuchsia-500/90 to-purple-600/90 hover:from-fuchsia-400 hover:to-purple-500 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-[0_0_22px_rgba(168,85,247,0.25)]"
      >
        + Nova senha
      </RouterLink>
    </div>

    <div v-if="loading" class="text-gray-400">Carregando...</div>
    <div v-else-if="error" class="text-red-400 font-semibold">{{ error }}</div>
    <div v-else-if="entries.length === 0" class="text-center text-gray-400 py-16">
      Nenhuma senha cadastrada.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="e in entries"
        :key="e.id"
        class="bg-white/5 rounded-2xl shadow-sm border border-white/10 backdrop-blur p-5"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="text-sm text-gray-500 mb-1">Atualizado: {{ formatDate(e.updatedAt) }}</div>
            <h2 class="text-xl font-bold text-slate-100">{{ e.title }}</h2>
            <div class="text-gray-400 mt-2 text-sm">
              <div v-if="e.username">Usuario: <span class="text-slate-200">{{ e.username }}</span></div>
              <div v-if="e.url">
                URL:
                <a :href="e.url" target="_blank" rel="noreferrer" class="text-cyan-200 underline underline-offset-3 break-all">
                  {{ e.url }}
                </a>
              </div>
            </div>

            <div class="mt-3">
              <div class="text-xs text-gray-500 mb-1">Senha</div>
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 font-mono text-sm text-slate-100">
                  {{ revealed[e.id] ? e.password : mask(e.password) }}
                </div>
                <button
                  @click="toggleReveal(e.id)"
                  class="bg-white/5 hover:bg-white/10 text-slate-100 font-bold px-3 py-2 rounded-xl transition-colors border border-white/10"
                >
                  {{ revealed[e.id] ? 'Ocultar' : 'Revelar' }}
                </button>
              </div>
              <div class="mt-2 flex gap-2 flex-wrap">
                <button
                  class="bg-white/5 hover:bg-white/10 text-slate-100 font-bold px-3 py-2 rounded-xl transition-colors border border-white/10"
                  @click="copy(e.password)"
                >
                  Copiar
                </button>
                <RouterLink
                  :to="`/passwords/edit/${e.id}`"
                  class="bg-white/5 hover:bg-white/10 text-slate-100 font-bold px-3 py-2 rounded-xl transition-colors border border-white/10"
                >
                  Editar
                </RouterLink>
                <button
                  class="bg-red-600/90 hover:bg-red-600 text-white font-bold px-3 py-2 rounded-xl transition-colors border border-red-400/20"
                  @click="handleDelete(e.id)"
                >
                  Excluir
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 mt-4">
              <span
                v-for="tag in normalizeTags(e.tags)"
                :key="tag"
                class="text-xs bg-cyan-500/10 text-cyan-200 px-2 py-1 rounded-full border border-cyan-400/20"
              >
                {{ tag }}
              </span>
              <span v-if="normalizeTags(e.tags).length === 0" class="text-xs text-gray-500">Sem tags</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 text-xs text-gray-500">
      Observacao: sem login, as senhas ficam armazenadas no banco. Evite usar senha real.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { PasswordEntry } from '@/types/passwords'
import { deletePassword, listPasswords } from '@/services/passwordsApi'

const entries = ref<PasswordEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const revealed = reactive<Record<number, boolean>>({})

function mask(password: string) {
  const len = (password || '').length
  return '•'.repeat(Math.min(len, 12)) + (len > 12 ? '…' : '')
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

function toggleReveal(id: number) {
  revealed[id] = !revealed[id]
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    alert('Copiado!')
  } catch {
    alert('Nao foi possivel copiar.')
  }
}

async function fetchEntries() {
  loading.value = true
  error.value = null
  try {
    entries.value = await listPasswords()
  } catch (err: any) {
    error.value = err?.message || 'Erro ao carregar senhas'
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  const ok = confirm('Excluir esta senha?')
  if (!ok) return
  try {
    await deletePassword(id)
    await fetchEntries()
  } catch (err: any) {
    alert(err?.message || 'Erro ao excluir')
  }
}

onMounted(fetchEntries)
</script>

