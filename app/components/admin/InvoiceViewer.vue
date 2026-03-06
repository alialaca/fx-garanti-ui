<script setup lang="ts">
const props = defineProps<{
  serialNumber: string
}>()

const { getInvoiceImage } = useAdminApi()

const invoiceUrl = ref('')
const loading = ref(false)
const error = ref('')
const zoomed = ref(false)

const isPdf = computed(() => {
  const pathWithoutQuery = invoiceUrl.value.split('?')[0]
  return pathWithoutQuery.toLowerCase().endsWith('.pdf')
})

const loadInvoice = async () => {
  if (invoiceUrl.value) {
    if (!isPdf.value) zoomed.value = !zoomed.value
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await getInvoiceImage(props.serialNumber)
    invoiceUrl.value = result.url
  } catch {
    error.value = 'Fatura belgesi yuklenemedi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <button
      v-if="!invoiceUrl"
      @click="loadInvoice"
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

    <!-- PDF Viewer -->
    <div v-if="invoiceUrl && isPdf" class="mt-3 space-y-2">
      <div class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <iframe
          :src="invoiceUrl"
          class="w-full h-[400px] sm:h-[500px] bg-gray-50 dark:bg-gray-900"
          title="Fatura belgesi"
        />
      </div>
      <a
        :href="invoiceUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        Yeni sekmede ac
      </a>
    </div>

    <!-- Image Viewer -->
    <div v-if="invoiceUrl && !isPdf" class="mt-3">
      <div
        class="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-zoom-in"
        :class="{ 'cursor-zoom-out': zoomed }"
        @click="zoomed = !zoomed"
      >
        <img
          :src="invoiceUrl"
          alt="Fatura belgesi"
          class="w-full transition-transform duration-300"
          :class="zoomed ? 'scale-125 sm:scale-150 origin-top' : 'scale-100'"
        />
      </div>
      <p class="mt-1 text-xs text-gray-400 text-center">Buyutmek icin tiklayiniz</p>
    </div>
  </div>
</template>
