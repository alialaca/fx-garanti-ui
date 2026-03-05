<script setup lang="ts">
import type { PaginationMeta } from '~/types/admin'

const props = defineProps<{
  meta: PaginationMeta
  perPage: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:perPage': [perPage: number]
}>()

const from = computed(() => (props.meta.page - 1) * props.meta.per_page + 1)
const to = computed(() => Math.min(props.meta.page * props.meta.per_page, props.meta.total))

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = props.meta.total_pages
  const current = props.meta.page

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push(-1) // ellipsis
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push(-1) // ellipsis
    pages.push(total)
  }
  return pages
})

const perPageOptions = [10, 20, 50]
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
    <!-- Info -->
    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
      <span class="font-medium text-gray-700 dark:text-gray-300">{{ from }}&ndash;{{ to }}</span>
      arasi, toplam
      <span class="font-medium text-gray-700 dark:text-gray-300">{{ meta.total }}</span>
      kayit
    </p>

    <div class="flex items-center gap-4">
      <!-- Per Page -->
      <select
        :value="perPage"
        @change="emit('update:perPage', Number(($event.target as HTMLSelectElement).value))"
        class="text-sm border border-gray-200/80 dark:border-gray-700/60 rounded-xl px-3 py-2 bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 backdrop-blur-sm transition-shadow"
      >
        <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }} / sayfa</option>
      </select>

      <!-- Page Numbers -->
      <nav class="flex items-center gap-1 p-1 bg-white/60 dark:bg-gray-900/40 rounded-xl border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm">
        <button
          :disabled="meta.page <= 1"
          @click="emit('update:page', meta.page - 1)"
          class="p-2.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <template v-for="(p, i) in visiblePages" :key="i">
          <span v-if="p === -1" class="px-1 text-gray-300 dark:text-gray-600 select-none">&hellip;</span>
          <button
            v-else
            @click="emit('update:page', p)"
            class="w-10 h-10 sm:w-9 sm:h-9 rounded-lg text-sm font-medium transition-all duration-200"
            :class="p === meta.page
              ? 'bg-primary text-white shadow-md shadow-primary/25 dark:bg-primary-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'"
          >
            {{ p }}
          </button>
        </template>

        <button
          :disabled="meta.page >= meta.total_pages"
          @click="emit('update:page', meta.page + 1)"
          class="p-2.5 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>
