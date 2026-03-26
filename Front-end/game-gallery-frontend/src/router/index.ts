import { createRouter, createWebHistory } from 'vue-router'
import NotesListView from '@/view/NotesListView.vue'
import NotesEditorView from '@/view/NotesEditorView.vue'
import NotesDetailsView from '@/view/NotesDetailsView.vue'
import PasswordsListView from '@/view/PasswordsListView.vue'
import PasswordsEditorView from '@/view/PasswordsEditorView.vue'
import TodosView from '@/view/TodosView.vue'
import FinanceView from '@/view/FinanceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/notes',
    },
    {
      path: '/notes',
      name: 'notes',
      component: NotesListView,
    },
    {
      path: '/notes/new',
      name: 'notes-new',
      component: NotesEditorView,
    },
    {
      path: '/notes/edit/:id',
      name: 'notes-edit',
      component: NotesEditorView,
    },
    {
      path: '/notes/:id',
      name: 'notes-details',
      component: NotesDetailsView,
    },
    {
      path: '/passwords',
      name: 'passwords',
      component: PasswordsListView,
    },
    {
      path: '/passwords/new',
      name: 'passwords-new',
      component: PasswordsEditorView,
    },
    {
      path: '/passwords/edit/:id',
      name: 'passwords-edit',
      component: PasswordsEditorView,
    },
    {
      path: '/todos',
      name: 'todos',
      component: TodosView,
    },
    {
      path: '/finance',
      name: 'finance',
      component: FinanceView,
    },
  ],
})

export default router
