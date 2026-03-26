<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import "./assets/main.css";

const menuOpen = ref(false);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function closeMenu() {
  menuOpen.value = false;
}

const navLinkClass =
  "app-nav-link inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-sm font-semibold " +
  "text-slate-200 border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/25 " +
  "hover:text-white transition-all duration-200 shadow-sm hover:shadow-[0_0_24px_rgba(45,212,191,0.12)]";

const navLinkAccentCyan =
  navLinkClass +
  " border-cyan-400/25 bg-gradient-to-br from-cyan-500/15 to-teal-600/10 hover:from-cyan-400/25 hover:to-teal-500/15";

const navLinkAccentIndigo =
  navLinkClass +
  " border-indigo-400/25 bg-gradient-to-br from-indigo-500/15 to-violet-600/10 hover:from-indigo-400/25 hover:to-violet-500/15";
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
    style="
      background: linear-gradient(90deg, rgba(2, 6, 23, 0.92), rgba(15, 23, 42, 0.88), rgba(2, 6, 23, 0.92));
      backdrop-filter: blur(14px);
    "
  >
    <div class="container mx-auto flex justify-between items-center gap-3 p-4">
      <RouterLink
        to="/notes"
        class="group shrink-0 text-xl sm:text-2xl font-extrabold tracking-tight transition-transform duration-200 hover:scale-[1.02]"
      >
        <span
          class="bg-gradient-to-r from-teal-200 via-cyan-200 to-emerald-200 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(45,212,191,0.35)]"
        >
          Bloco de Notas
        </span>
      </RouterLink>

      <!-- Desktop -->
      <nav class="hidden md:flex flex-wrap items-center justify-end gap-2 max-w-[70%]">
        <RouterLink to="/passwords" :class="navLinkClass" exact-active-class="nav-link-exact">
          Senhas
        </RouterLink>
        <RouterLink to="/todos" :class="navLinkClass" exact-active-class="nav-link-exact">
          To-do
        </RouterLink>
        <RouterLink to="/finance" :class="navLinkAccentIndigo" exact-active-class="nav-link-exact">
          Controle de finanças
        </RouterLink>

        <span class="hidden lg:inline w-px h-6 bg-white/15 mx-1 self-center" aria-hidden="true" />

        <RouterLink to="/notes" :class="navLinkClass" exact-active-class="nav-link-exact">
          Lembretes
        </RouterLink>
        <RouterLink to="/notes/new" :class="navLinkAccentCyan" exact-active-class="nav-link-exact">
          Novo lembrete
        </RouterLink>
      </nav>

      <!-- Mobile -->
      <button
        type="button"
        class="md:hidden inline-flex items-center justify-center min-w-[3rem] h-11 px-3 rounded-2xl font-bold text-xs tracking-wide text-slate-100 border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.04] hover:from-white/15 hover:to-white/[0.08] shadow-[0_0_24px_rgba(45,212,191,0.12)] transition-all active:scale-[0.98]"
        @click="toggleMenu"
        aria-label="Abrir menu"
      >
        <span class="sr-only">Menu</span>
        <span v-if="!menuOpen">MENU</span>
        <span v-else>FECHAR</span>
      </button>
    </div>

    <div v-if="menuOpen" class="md:hidden px-4 pb-4">
      <div
        class="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] backdrop-blur-xl p-3 shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
      >
        <div class="flex flex-col gap-2">
          <RouterLink to="/passwords" :class="navLinkClass" exact-active-class="nav-link-exact" @click="closeMenu">
            Senhas
          </RouterLink>
          <RouterLink to="/todos" :class="navLinkClass" exact-active-class="nav-link-exact" @click="closeMenu">
            To-do
          </RouterLink>
          <RouterLink to="/finance" :class="navLinkAccentIndigo" exact-active-class="nav-link-exact" @click="closeMenu">
            Controle de finanças
          </RouterLink>

          <div class="my-1 h-px bg-white/10" />

          <RouterLink to="/notes" :class="navLinkClass" exact-active-class="nav-link-exact" @click="closeMenu">
            Lembretes
          </RouterLink>
          <RouterLink
            to="/notes/new"
            :class="navLinkAccentCyan"
            exact-active-class="nav-link-exact"
            @click="closeMenu"
          >
            Novo lembrete
          </RouterLink>
        </div>
      </div>
    </div>
  </header>

  <main class="container mx-auto mt-6 p-4 pb-10 max-w-6xl">
    <RouterView />
  </main>
</template>

<style scoped></style>
