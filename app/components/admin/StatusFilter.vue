<script setup lang="ts">
interface StatusTab {
  key: string
  label: string
  count?: number
}

const props = defineProps<{
  modelValue: string
  tabs: StatusTab[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2 p-1.5 bg-white/60 dark:bg-gray-900/40 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm w-full sm:w-fit">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="emit('update:modelValue', tab.key)"
      class="relative inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-sm font-medium transition-all duration-300"
      :class="modelValue === tab.key
        ? 'bg-primary text-white shadow-lg shadow-primary/25 dark:bg-primary-600 scale-[1.02]'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/60'"
    >
      {{ tab.label }}
      <span
        v-if="tab.count !== undefined"
        class="px-1.5 py-0.5 rounded-md text-xs font-semibold min-w-[1.25rem] text-center transition-colors duration-300"
        :class="modelValue === tab.key
          ? 'bg-white/20 text-white'
          : tab.key === 'pending'
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
            : 'bg-gray-200/70 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400'"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>
