<template>
  <div class="max-w-6xl mx-auto relative">
    <div
      v-if="saving"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div
        class="flex flex-col items-center gap-4 rounded-2xl border border-indigo-400/25 bg-slate-900/95 px-10 py-8 shadow-[0_0_40px_rgba(99,102,241,0.15)]"
      >
        <span
          class="inline-block h-10 w-10 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-300"
          aria-hidden="true"
        />
        <p class="text-slate-100 font-semibold">Salvando conta…</p>
        <p class="text-sm text-slate-400 text-center max-w-xs">Gravando no banco de dados.</p>
      </div>
    </div>

    <div class="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-extrabold text-indigo-200 drop-shadow-[0_0_22px_rgba(99,102,241,0.35)]">
          Controle de Finanças
        </h1>
        <p class="text-gray-400 mt-1 max-w-2xl">
          Valores sempre em <strong class="text-slate-300">real (BRL)</strong>. O
          <strong class="text-slate-300">total geral</strong> soma todas as contas ainda não marcadas como pagas. O mês
          serve só para destacar o que vence naquele período.
        </p>
      </div>
    </div>

    <div
      v-if="formError"
      class="mb-4 rounded-xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-red-200 font-semibold"
      role="alert"
    >
      {{ formError }}
    </div>

    <div
      v-if="error"
      class="mb-4 rounded-xl border border-red-400/40 bg-red-950/50 px-4 py-3 text-red-200 font-semibold"
      role="alert"
    >
      {{ error }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 bg-white/5 rounded-2xl shadow-sm border border-white/10 backdrop-blur p-4">
        <div class="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
          <div class="flex-1">
            <label class="text-xs text-gray-400 mb-1 block">Mês (referência)</label>
            <input
              v-model="month"
              type="month"
              class="finance-date-input w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
              @change="onMonthChange"
            />
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              :disabled="listLoading"
              class="bg-gradient-to-r from-indigo-500/90 to-blue-600/90 hover:from-indigo-400 hover:to-blue-500 text-white font-bold px-5 py-2 rounded-xl transition-colors border border-indigo-400/20 disabled:opacity-50"
              @click="refreshBills"
            >
              Atualizar
            </button>
            <button
              type="button"
              :disabled="listLoading || clearing"
              class="bg-white/5 hover:bg-white/10 text-slate-100 font-bold px-5 py-2 rounded-xl transition-colors border border-white/15 disabled:opacity-50"
              @click="clearAll"
            >
              {{ clearing ? 'Limpando…' : 'Limpar' }}
            </button>
          </div>
        </div>

        <div v-if="listLoading" class="text-gray-400 py-8">Carregando contas…</div>

        <template v-else>
          <div class="mb-6 space-y-4">
            <div>
              <div class="text-sm text-gray-400">Total geral a pagar</div>
              <div class="text-4xl font-extrabold text-slate-100 drop-shadow-[0_0_22px_rgba(99,102,241,0.25)]">
                {{ formatMoneyBRL(grandTotal) }}
              </div>
              <p class="text-xs text-gray-500 mt-2">
                Soma de todas as contas com status diferente de <strong class="text-slate-400">Pago</strong> (inclui
                vencimentos em qualquer mês).
              </p>
            </div>
            <div class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div class="text-xs text-gray-400">Parcela referente ao mês {{ month }}</div>
              <div class="text-xl font-bold text-indigo-200 mt-1">{{ formatMoneyBRL(monthSubtotal) }}</div>
              <p class="text-xs text-gray-500 mt-1">
                Apenas contas com próximo vencimento neste mês e ainda não pagas.
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <article
              v-for="b in sortedBills"
              :key="b.id"
              class="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
              :class="{ 'opacity-60': b.paymentStatus === 'PAID' }"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span :class="paymentStatusBadgeClass(b.paymentStatus)">
                      {{ paymentStatusLabel(b.paymentStatus) }}
                    </span>
                    <span
                      v-if="billInSelectedMonth(b)"
                      class="text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                    >
                      Vence neste mês
                    </span>
                    <span
                      v-else
                      class="text-xs font-semibold px-2 py-0.5 rounded-full border border-white/15 bg-white/[0.06] text-slate-400"
                    >
                      Outro mês
                    </span>
                    <span
                      v-if="b.installmentCount != null"
                      class="text-xs font-semibold px-2 py-0.5 rounded-full border border-violet-400/25 bg-violet-500/10 text-violet-200"
                    >
                      {{ b.installmentCount }} parcelas
                    </span>
                  </div>
                  <h3 class="font-bold text-slate-100 text-lg">{{ b.title }}</h3>
                  <div class="text-sm text-slate-200 font-bold mt-1">
                    {{ formatMoneyBRL(b.amount) }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    Próximo vencimento: {{ formatDate(b.nextDueDate) }} · {{ recurrenceLabel(b.recurrence) }}
                  </div>
                </div>

                <div class="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    class="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/12"
                    :aria-expanded="expandedIds.includes(b.id)"
                    @click="toggleExpand(b.id)"
                  >
                    {{ expandedIds.includes(b.id) ? 'Recolher' : 'Expandir' }}
                  </button>
                  <button
                    type="button"
                    class="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/12"
                    @click="loadBillForEdit(b)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    :disabled="!b.nextDueDate"
                    class="bg-gradient-to-r from-emerald-500/90 to-green-600/90 hover:from-emerald-400 hover:to-green-500 text-white font-bold px-3 py-2 rounded-xl text-sm border border-emerald-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    @click="pay(b.id)"
                  >
                    Marcar pago
                  </button>
                  <button
                    type="button"
                    class="bg-red-600/90 hover:bg-red-600 text-white font-bold px-3 py-2 rounded-xl text-sm border border-red-400/20"
                    @click="remove(b.id)"
                  >
                    Excluir
                  </button>
                </div>
              </div>

              <div
                v-if="expandedIds.includes(b.id)"
                class="text-sm text-gray-400 border-t border-white/10 pt-3 space-y-1"
              >
                <p>Vencimento original: {{ formatDate(b.dueDate) }}</p>
                <p v-if="b.lastPaidAt">Último pagamento: {{ formatDate(b.lastPaidAt) }}</p>
                <p v-else>Último pagamento: —</p>
              </div>
            </article>

            <div v-if="sortedBills.length === 0" class="text-gray-400 py-10 text-center">
              Nenhuma conta cadastrada. Use o formulário à direita para salvar a primeira.
            </div>
          </div>
        </template>
      </div>

      <div class="bg-white/5 rounded-2xl shadow-sm border border-white/10 backdrop-blur p-4 h-fit lg:sticky lg:top-24">
        <h2 class="text-lg font-bold text-slate-100 mb-1">
          {{ editingId != null ? 'Editar conta' : 'Adicionar conta' }}
        </h2>
        <p v-if="editingId != null" class="text-xs text-amber-200/90 mb-3">
          Alterando #{{ editingId }} — salve para atualizar ou cancele para voltar ao cadastro novo.
        </p>

        <div class="flex flex-col gap-3">
          <label class="text-xs text-gray-400">Título</label>
          <input
            v-model="newTitle"
            type="text"
            class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            placeholder="Ex: aluguel"
          />

          <label class="text-xs text-gray-400">Valor (R$)</label>
          <input
            :value="formatBRLDigits(amountDigits) || ''"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            placeholder="R$ 0,00"
            class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            @input="onAmountInput"
          />

          <label class="text-xs text-gray-400">Quantidade de parcelas (opcional)</label>
          <input
            v-model="newInstallmentCount"
            type="number"
            min="1"
            step="1"
            placeholder="Ex: 12"
            class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />

          <label class="text-xs text-gray-400">Status do pagamento</label>
          <select
            v-model="newPaymentStatus"
            class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          >
            <option value="PENDING">Pendente</option>
            <option value="PARTIAL">Parcial</option>
            <option value="OVERDUE">Atrasado</option>
            <option value="PAID">Pago</option>
          </select>

          <label class="text-xs text-gray-400">Vencimento (próximo ou inicial)</label>
          <input
            v-model="newDueDate"
            type="date"
            class="finance-date-input w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />

          <label class="text-xs text-gray-400">Recorrência</label>
          <select
            v-model="newRecurrence"
            class="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          >
            <option value="NONE">Uma vez</option>
            <option value="MONTHLY">Mensal</option>
            <option value="YEARLY">Anual</option>
          </select>

          <div class="flex flex-col gap-2 mt-1">
            <button
              type="button"
              :disabled="saving"
              class="bg-gradient-to-r from-indigo-500/90 to-blue-600/90 hover:from-indigo-400 hover:to-blue-500 text-white font-bold px-5 py-2 rounded-xl transition-colors border border-indigo-400/20 disabled:opacity-60 disabled:cursor-wait"
              @click="save"
            >
              {{ saving ? 'Salvando…' : editingId != null ? 'Atualizar conta' : 'Salvar conta' }}
            </button>
            <button
              v-if="editingId != null"
              type="button"
              @click="cancelEdit"
              class="bg-white/5 hover:bg-white/10 text-slate-100 font-semibold px-5 py-2 rounded-xl border border-white/10"
            >
              Cancelar edição
            </button>
          </div>

          <div class="text-xs text-gray-500 pt-1">
            Ao marcar como pago, a próxima data de vencimento é calculada automaticamente (mensal/anual) e o status volta
            para pendente.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Bill, BillPaymentStatus, Recurrence } from '@/types/finance'
import { createBill, deleteAllBills, deleteBill, listBills, payBill, updateBill } from '@/services/financeApi'

const now = new Date()
const pad2 = (n: number) => String(n).padStart(2, '0')
const currentMonth = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`

const month = ref<string>(currentMonth)

const allBills = ref<Bill[]>([])
const listLoading = ref(false)
const clearing = ref(false)
const error = ref<string | null>(null)
const formError = ref<string | null>(null)
const saving = ref(false)

const editingId = ref<number | null>(null)
const expandedIds = ref<number[]>([])

const newTitle = ref('')
const amountDigits = ref('')
/** `type="number"` pode transformar o v-model em número — sempre normalizar para string */
const newInstallmentCount = ref<string | number>('')
const newPaymentStatus = ref<BillPaymentStatus>('PENDING')
const newDueDate = ref<string>('')
const newRecurrence = ref<Recurrence>('MONTHLY')

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString()
}

function formatMoneyBRL(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

function formatBRLDigits(digits: string) {
  if (!digits) return ''
  const n = parseInt(digits, 10) / 100
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function onAmountInput(e: Event) {
  const digits = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  amountDigits.value = digits
  // Valor exibido vem só do :value (Vue) — não atribuir `el.value` aqui para não brigar com o binding
}

function amountFromDigits(): number {
  const d = amountDigits.value.replace(/\D/g, '')
  if (!d) return 0
  return parseInt(d, 10) / 100
}

function recurrenceLabel(r: Recurrence) {
  switch (r) {
    case 'MONTHLY':
      return 'Mensal'
    case 'YEARLY':
      return 'Anual'
    default:
      return 'Uma vez'
  }
}

function paymentStatusLabel(s: BillPaymentStatus) {
  const map: Record<BillPaymentStatus, string> = {
    PENDING: 'Pendente',
    PAID: 'Pago',
    PARTIAL: 'Parcial',
    OVERDUE: 'Atrasado',
  }
  return map[s] || s
}

function paymentStatusBadgeClass(s: BillPaymentStatus) {
  const base = 'text-xs font-semibold px-2 py-0.5 rounded-full border'
  switch (s) {
    case 'PAID':
      return `${base} border-emerald-400/35 bg-emerald-500/15 text-emerald-200`
    case 'OVERDUE':
      return `${base} border-red-400/35 bg-red-500/15 text-red-200`
    case 'PARTIAL':
      return `${base} border-amber-400/35 bg-amber-500/15 text-amber-200`
    default:
      return `${base} border-slate-400/30 bg-slate-500/15 text-slate-200`
  }
}

function countsTowardTotal(b: Bill): boolean {
  return b.paymentStatus !== 'PAID'
}

function billInSelectedMonth(b: Bill): boolean {
  return billInMonth(b.nextDueDate, month.value)
}

function billInMonth(due: string | null, monthStr: string): boolean {
  if (!due) return false
  const d = new Date(due)
  if (Number.isNaN(d.getTime())) return false
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const [yStr, mStr] = monthStr.split('-')
  return y === Number(yStr) && m === Number(mStr)
}

const sortedBills = computed(() => {
  return [...allBills.value].sort((a, b) => {
    const ta = a.nextDueDate ? new Date(a.nextDueDate).getTime() : Number.POSITIVE_INFINITY
    const tb = b.nextDueDate ? new Date(b.nextDueDate).getTime() : Number.POSITIVE_INFINITY
    return ta - tb
  })
})

const grandTotal = computed(() =>
  sortedBills.value.filter(countsTowardTotal).reduce((acc, b) => acc + Number(b.amount), 0),
)

const monthSubtotal = computed(() =>
  sortedBills.value
    .filter(b => billInSelectedMonth(b) && countsTowardTotal(b))
    .reduce((acc, b) => acc + Number(b.amount), 0),
)

function toggleExpand(id: number) {
  const i = expandedIds.value.indexOf(id)
  if (i >= 0) expandedIds.value = expandedIds.value.filter(x => x !== id)
  else expandedIds.value = [...expandedIds.value, id]
}

function toInputDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function loadBillForEdit(b: Bill) {
  editingId.value = b.id
  formError.value = null
  newTitle.value = b.title
  amountDigits.value = String(Math.round(Number(b.amount) * 100))
  newInstallmentCount.value = b.installmentCount != null ? String(b.installmentCount) : ''
  newPaymentStatus.value = b.paymentStatus
  newDueDate.value = toInputDate(b.nextDueDate || b.dueDate)
  newRecurrence.value = b.recurrence
}

function cancelEdit() {
  editingId.value = null
  formError.value = null
  resetFormDefaults()
}

function resetFormDefaults() {
  newTitle.value = ''
  amountDigits.value = ''
  newInstallmentCount.value = ''
  newPaymentStatus.value = 'PENDING'
  newRecurrence.value = 'MONTHLY'
  const t = new Date()
  newDueDate.value = `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`
}

function installmentInputStr(): string {
  const v = newInstallmentCount.value
  if (v === '' || v === null || v === undefined) return ''
  return String(v).trim()
}

function parseInstallmentCount(): number | null {
  const t = installmentInputStr()
  if (!t) return null
  const n = parseInt(t, 10)
  if (!Number.isFinite(n) || n < 1) return null
  return n
}

async function refreshBills() {
  listLoading.value = true
  error.value = null
  try {
    allBills.value = await listBills()
  } catch (err: any) {
    error.value = err?.message || 'Erro ao carregar contas'
  } finally {
    listLoading.value = false
  }
}

async function clearAll() {
  if (allBills.value.length === 0) {
    formError.value = 'Não há contas para remover.'
    return
  }
  const ok = confirm(
    'Remover todas as contas cadastradas? Esta ação não pode ser desfeita.',
  )
  if (!ok) return
  formError.value = null
  error.value = null
  clearing.value = true
  try {
    await deleteAllBills()
    editingId.value = null
    expandedIds.value = []
    resetFormDefaults()
    await refreshBills()
  } catch (err: any) {
    error.value = err?.message || 'Erro ao limpar contas'
  } finally {
    clearing.value = false
  }
}

function onMonthChange() {
  formError.value = null
}

async function save() {
  formError.value = null
  if (!newTitle.value.trim()) {
    formError.value = 'Informe o título da conta.'
    return
  }
  if (!newDueDate.value) {
    formError.value = 'Informe o vencimento.'
    return
  }
  const amt = amountFromDigits()
  if (!Number.isFinite(amt) || amt < 0) {
    formError.value = 'Informe um valor válido.'
    return
  }
  if (amt <= 0) {
    formError.value =
      'Informe um valor maior que zero. Digite só números: eles entram como centavos (ex.: 250000 = R$ 2.500,00).'
    return
  }

  const inst = parseInstallmentCount()
  if (installmentInputStr() !== '' && inst === null) {
    formError.value = 'Quantidade de parcelas inválida (use um número inteiro ≥ 1).'
    return
  }

  const payload = {
    title: newTitle.value.trim(),
    amount: amt,
    dueDate: newDueDate.value,
    recurrence: newRecurrence.value,
    installmentCount: inst,
    paymentStatus: newPaymentStatus.value,
  }

  saving.value = true
  try {
    if (editingId.value != null) {
      await updateBill(editingId.value, payload)
      editingId.value = null
    } else {
      await createBill(payload)
    }
    resetFormDefaults()
    expandedIds.value = []
    await refreshBills()
  } catch (err: any) {
    formError.value = err?.message || 'Erro ao salvar conta'
  } finally {
    saving.value = false
  }
}

async function pay(id: number) {
  formError.value = null
  try {
    await payBill(id)
    await refreshBills()
  } catch (err: any) {
    formError.value = err?.message || 'Erro ao marcar como pago'
  }
}

async function remove(id: number) {
  const ok = confirm('Excluir esta conta?')
  if (!ok) return
  formError.value = null
  try {
    await deleteBill(id)
    if (editingId.value === id) cancelEdit()
    await refreshBills()
  } catch (err: any) {
    formError.value = err?.message || 'Erro ao excluir'
  }
}

onMounted(async () => {
  if (!newDueDate.value) {
    const t = new Date()
    newDueDate.value = `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`
  }
  await refreshBills()
})
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
