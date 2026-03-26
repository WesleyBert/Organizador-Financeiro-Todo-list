<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-extrabold text-cyan-200 drop-shadow-[0_0_22px_rgba(34,211,238,0.35)]">
          To-do
        </h1>
        <p class="text-gray-400 mt-1">Organize suas tarefas por categoria e marque como feitas.</p>
      </div>

      <button
        type="button"
        class="bg-white/5 hover:bg-white/10 text-slate-100 font-bold px-4 py-2 rounded-xl transition-colors border border-white/10"
        @click="refresh"
      >
        Atualizar tudo
      </button>
    </div>

    <div v-if="pageError" class="mb-4 rounded-xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-red-200 font-semibold">
      {{ pageError }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="bg-white/5 rounded-2xl shadow-sm border border-white/10 backdrop-blur p-4">
        <div class="flex items-center justify-between gap-2 mb-3">
          <h2 class="text-lg font-bold text-slate-100">Categorias</h2>
          <button
            type="button"
            class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/10"
            @click="loadCategories"
          >
            Atualizar
          </button>
        </div>

        <div class="flex gap-2 mb-4">
          <input
            v-model="newCategoryName"
            type="text"
            class="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            placeholder="Nova categoria"
            @keyup.enter="createCategory"
          />
          <button
            type="button"
            class="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-[0_0_22px_rgba(34,211,238,0.15)] border border-cyan-400/20"
            @click="createCategory"
          >
            Add
          </button>
        </div>

        <div v-if="loadingCategories" class="text-gray-400">Carregando...</div>
        <div v-else-if="categories.length === 0" class="text-gray-400 py-10">
          Crie uma categoria para começar.
        </div>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="c in categories"
            :key="c.id"
            class="rounded-xl border transition-colors"
            :class="
              selectedCategoryId === c.id
                ? 'border-cyan-400/40 bg-white/10'
                : 'border-white/10 bg-white/5'
            "
          >
            <template v-if="editingCategoryId === c.id">
              <div class="p-3 flex flex-col gap-2">
                <input
                  v-model="editCategoryName"
                  type="text"
                  class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  placeholder="Nome"
                />
                <div class="flex items-center gap-2">
                  <label class="text-xs text-gray-400 shrink-0">Cor</label>
                  <input v-model="editCategoryColor" type="color" class="h-9 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white font-bold px-3 py-1.5 rounded-lg text-sm border border-cyan-400/20"
                    @click="saveCategoryEdit(c.id)"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    class="bg-white/5 text-slate-100 font-semibold px-3 py-1.5 rounded-lg text-sm border border-white/10"
                    @click="cancelCategoryEdit"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center gap-2 p-2">
                <button
                  type="button"
                  class="flex-1 min-w-0 text-left px-2 py-2 rounded-lg font-bold text-slate-100 hover:bg-white/5"
                  @click="selectCategory(c.id)"
                >
                  <span class="inline-block w-2 h-2 rounded-full mr-2 align-middle" :style="{ background: c.color }" />
                  {{ c.name }}
                </button>
                <button
                  type="button"
                  class="text-xs font-semibold px-2 py-2 rounded-lg border border-white/15 text-slate-200 hover:bg-white/10"
                  @click.stop="startEditCategory(c)"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="text-xs font-semibold px-2 py-2 rounded-lg border border-red-400/30 text-red-200 hover:bg-red-950/40"
                  @click.stop="deleteCategory(c.id)"
                >
                  Excluir
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="bg-white/5 rounded-2xl shadow-sm border border-white/10 backdrop-blur p-4">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 class="text-lg font-bold text-slate-100">Itens</h2>
            <button
              v-if="selectedCategoryId"
              type="button"
              class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/10"
              :disabled="loadingItems"
              @click="reloadItems"
            >
              Atualizar lista
            </button>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
            <div class="flex-1">
              <label class="text-xs text-gray-400 mb-1 block">Nova tarefa</label>
              <input
                v-model="newTodoText"
                type="text"
                class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                placeholder="Ex: pagar boleto"
                @keyup.enter="createTodo"
              />
            </div>
            <div class="w-full sm:w-44">
              <label class="text-xs text-gray-400 mb-1 block">Vencimento</label>
              <input
                v-model="newTodoDueDate"
                type="date"
                class="finance-date-input w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              />
            </div>
            <button
              type="button"
              @click="createTodo"
              :disabled="!selectedCategoryId"
              class="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-5 py-2 rounded-xl transition-colors border border-cyan-400/20 disabled:opacity-60"
            >
              Add
            </button>
          </div>

          <div v-if="loadingItems" class="text-gray-400">Carregando...</div>
          <div v-else-if="!selectedCategoryId" class="text-gray-400 py-10">
            Selecione uma categoria.
          </div>
          <div v-else-if="items.length === 0" class="text-gray-400 py-10">
            Nenhuma tarefa nesta categoria.
          </div>

          <div v-else class="flex flex-col gap-2">
            <div
              v-for="it in items"
              :key="it.id"
              class="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <template v-if="editingItemId === it.id">
                <div class="flex flex-col gap-2 flex-1 min-w-0 w-full">
                  <label class="text-xs text-gray-400">Texto</label>
                  <input
                    v-model="editItemText"
                    type="text"
                    class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                  <label class="text-xs text-gray-400">Vencimento</label>
                  <input
                    v-model="editItemDueDate"
                    type="date"
                    class="finance-date-input w-full sm:max-w-xs bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                  />
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white font-bold px-4 py-2 rounded-xl text-sm border border-cyan-400/20"
                      @click="saveItemEdit(it.id)"
                    >
                      Salvar alterações
                    </button>
                    <button
                      type="button"
                      class="bg-white/5 text-slate-100 font-semibold px-4 py-2 rounded-xl text-sm border border-white/10"
                      @click="cancelItemEdit"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    :checked="it.done"
                    class="mt-1"
                    @change="toggleDone(it)"
                  />

                  <div class="min-w-0">
                    <div :class="['font-bold', it.done ? 'text-emerald-200 line-through' : 'text-slate-100']">
                      {{ it.text }}
                    </div>
                    <div v-if="it.dueDate" class="text-xs text-gray-400 mt-1">
                      Vence: {{ formatDate(it.dueDate) }}
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    class="bg-white/5 hover:bg-white/10 text-slate-100 font-bold px-3 py-2 rounded-xl text-sm border border-white/15"
                    @click="startEditItem(it)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="bg-red-600/90 hover:bg-red-600 text-white font-bold px-3 py-2 rounded-xl text-sm border border-red-400/20"
                    @click="deleteItem(it.id)"
                  >
                    Excluir
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TodoCategory, TodoItem } from '@/types/todo'
import {
  createTodoCategory,
  createTodoItem,
  deleteTodoCategory,
  deleteTodoItem,
  listTodoCategories,
  listTodoItems,
  updateTodoCategory,
  updateTodoItem,
} from '@/services/todoApi'

const categories = ref<TodoCategory[]>([])
const items = ref<TodoItem[]>([])
const selectedCategoryId = ref<number | null>(null)

const loadingCategories = ref(false)
const loadingItems = ref(false)
const pageError = ref<string | null>(null)

const newCategoryName = ref('')

const editingCategoryId = ref<number | null>(null)
const editCategoryName = ref('')
const editCategoryColor = ref('#22d3ee')

const newTodoText = ref('')
const newTodoDueDate = ref<string | null>(null)

const editingItemId = ref<number | null>(null)
const editItemText = ref('')
const editItemDueDate = ref('')

const pad2 = (n: number) => String(n).padStart(2, '0')

function toInputDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

async function refresh() {
  pageError.value = null
  try {
    await loadCategories()
    if (!selectedCategoryId.value && categories.value[0]?.id) {
      selectedCategoryId.value = categories.value[0].id
    }
    if (selectedCategoryId.value) {
      await loadItems(selectedCategoryId.value)
    }
  } catch (e: any) {
    pageError.value = e?.message || 'Erro ao atualizar'
  }
}

function reloadItems() {
  if (selectedCategoryId.value) loadItems(selectedCategoryId.value)
}

function selectCategory(id: number) {
  editingItemId.value = null
  selectedCategoryId.value = id
  loadItems(id)
}

async function loadCategories() {
  loadingCategories.value = true
  try {
    categories.value = await listTodoCategories()
  } catch (e: any) {
    pageError.value = e?.message || 'Erro ao carregar categorias'
  } finally {
    loadingCategories.value = false
  }
}

async function loadItems(categoryId: number) {
  loadingItems.value = true
  try {
    items.value = await listTodoItems(categoryId)
  } catch (e: any) {
    pageError.value = e?.message || 'Erro ao carregar tarefas'
  } finally {
    loadingItems.value = false
  }
}

async function createCategory() {
  pageError.value = null
  if (!newCategoryName.value.trim()) return
  try {
    const created = await createTodoCategory({ name: newCategoryName.value.trim() })
    newCategoryName.value = ''
    await loadCategories()
    selectedCategoryId.value = created.id
    await loadItems(created.id)
  } catch (e: any) {
    pageError.value = e?.message || 'Erro ao criar categoria'
  }
}

function startEditCategory(c: TodoCategory) {
  editingCategoryId.value = c.id
  editCategoryName.value = c.name
  editCategoryColor.value = c.color || '#22d3ee'
}

function cancelCategoryEdit() {
  editingCategoryId.value = null
}

async function saveCategoryEdit(id: number) {
  pageError.value = null
  if (!editCategoryName.value.trim()) {
    pageError.value = 'Informe o nome da categoria.'
    return
  }
  try {
    await updateTodoCategory(id, {
      name: editCategoryName.value.trim(),
      color: editCategoryColor.value,
    })
    editingCategoryId.value = null
    await loadCategories()
    if (selectedCategoryId.value) await loadItems(selectedCategoryId.value)
  } catch (e: any) {
    pageError.value = e?.message || 'Erro ao salvar categoria'
  }
}

async function deleteCategory(id: number) {
  pageError.value = null
  const ok = confirm('Excluir esta categoria? As tarefas dela também serão removidas.')
  if (!ok) return
  try {
    await deleteTodoCategory(id)
    if (selectedCategoryId.value === id) {
      selectedCategoryId.value = null
      items.value = []
    }
    editingCategoryId.value = null
    await loadCategories()
    if (!selectedCategoryId.value && categories.value[0]?.id) {
      selectedCategoryId.value = categories.value[0].id
      await loadItems(selectedCategoryId.value)
    }
  } catch (e: any) {
    pageError.value = e?.message || 'Erro ao excluir categoria'
  }
}

async function createTodo() {
  pageError.value = null
  if (!selectedCategoryId.value) return
  if (!newTodoText.value.trim()) return

  try {
    const payload = {
      categoryId: selectedCategoryId.value,
      text: newTodoText.value.trim(),
      dueDate: newTodoDueDate.value || null,
    }
    await createTodoItem(payload)
    newTodoText.value = ''
    newTodoDueDate.value = null
    await loadItems(selectedCategoryId.value)
  } catch (e: any) {
    pageError.value = e?.message || 'Erro ao criar tarefa'
  }
}

function startEditItem(it: TodoItem) {
  editingItemId.value = it.id
  editItemText.value = it.text
  editItemDueDate.value = toInputDate(it.dueDate)
}

function cancelItemEdit() {
  editingItemId.value = null
}

async function saveItemEdit(id: number) {
  pageError.value = null
  if (!editItemText.value.trim()) {
    pageError.value = 'Informe o texto da tarefa.'
    return
  }
  try {
    await updateTodoItem(id, {
      text: editItemText.value.trim(),
      dueDate: editItemDueDate.value ? editItemDueDate.value : null,
    })
    editingItemId.value = null
    if (selectedCategoryId.value) await loadItems(selectedCategoryId.value)
  } catch (e: any) {
    pageError.value = e?.message || 'Erro ao salvar tarefa'
  }
}

async function toggleDone(it: TodoItem) {
  pageError.value = null
  try {
    await updateTodoItem(it.id, { done: !it.done })
    await loadItems(it.categoryId)
  } catch (e: any) {
    pageError.value = e?.message || 'Erro ao atualizar tarefa'
  }
}

async function deleteItem(id: number) {
  pageError.value = null
  const ok = confirm('Excluir esta tarefa?')
  if (!ok) return
  try {
    await deleteTodoItem(id)
    if (editingItemId.value === id) editingItemId.value = null
    if (selectedCategoryId.value) await loadItems(selectedCategoryId.value)
  } catch (e: any) {
    pageError.value = e?.message || 'Erro ao excluir tarefa'
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString()
}

onMounted(refresh)
</script>

<style scoped>
.finance-date-input {
  color-scheme: dark;
}

.finance-date-input::-webkit-datetime-edit-fields-wrapper {
  color: rgb(241 245 249);
}

.finance-date-input::-webkit-datetime-edit-text {
  color: rgb(148 163 184);
}
</style>
