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
  <div class="flex flex-wrap gap-2">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="emit('update:modelValue', tab.key)"
      class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
      :class="modelValue === tab.key
        ? 'bg-primary text-white shadow-md shadow-primary/25 dark:bg-primary-600'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'"
    >
      {{ tab.label }}
      <span
        v-if="tab.count !== undefined"
        class="px-1.5 py-0.5 rounded-md text-xs font-semibold min-w-[1.25rem] text-center"
        :class="modelValue === tab.key
          ? 'bg-white/20 text-white'
          : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>
