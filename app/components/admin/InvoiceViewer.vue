<script setup lang="ts">
const props = defineProps<{
  serialNumber: string
}>()

const { getInvoiceImage } = useAdminApi()

const imageUrl = ref('')
const loading = ref(false)
const error = ref('')
const zoomed = ref(false)

const loadImage = async () => {
  if (imageUrl.value) {
    zoomed.value = !zoomed.value
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await getInvoiceImage(props.serialNumber)
    imageUrl.value = result.url
  } catch {
    error.value = 'Fatura gorseli yuklenemedi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <button
      v-if="!imageUrl"
      @click="loadImage"
      :disabled="loading"
      class="btn-secondary w-full text-sm"
    >
      <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      <span>Fatura Goruntule</span>
    </button>

    <div v-if="error" class="mt-2 text-sm text-red-500 dark:text-red-400">{{ error }}</div>

    <div v-if="imageUrl" class="mt-3">
      <div
        class="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-zoom-in"
        :class="{ 'cursor-zoom-out': zoomed }"
        @click="zoomed = !zoomed"
      >
        <img
          :src="imageUrl"
          alt="Fatura gorseli"
          class="w-full transition-transform duration-300"
          :class="zoomed ? 'scale-125 sm:scale-150 origin-top' : 'scale-100'"
        />
      </div>
      <p class="mt-1 text-xs text-gray-400 text-center">Buyutmek icin tiklayiniz</p>
    </div>
  </div>
</template>
