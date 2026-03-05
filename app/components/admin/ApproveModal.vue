<script setup lang="ts">
import type { AdminWarranty } from '~/types/admin'

const props = defineProps<{
  warranty: AdminWarranty
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  approved: [warranty: AdminWarranty]
}>()

const { approveWarranty } = useAdminApi()

const warrantyStartDate = ref('')
const invoiceDate = ref('')
const invoiceNumber = ref('')
const loading = ref(false)
const error = ref('')

watch(() => props.open, (val) => {
  if (val) {
    warrantyStartDate.value = new Date().toISOString().split('T')[0]
    invoiceDate.value = ''
    invoiceNumber.value = ''
    error.value = ''
  }
})

const handleApprove = async () => {
  if (!warrantyStartDate.value) return

  loading.value = true
  error.value = ''

  try {
    const result = await approveWarranty(props.warranty.serialNumber, {
      warrantyStartDate: warrantyStartDate.value,
      invoiceDate: invoiceDate.value || undefined,
      invoiceNumber: invoiceNumber.value || undefined
    })
    emit('approved', result)
    emit('close')
  } catch (err: any) {
    const message = err.response?.data?.message
    error.value = (typeof message === 'string' && message.length < 200) ? message : 'Onay islemi basarisiz oldu.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="emit('close')"></div>

        <div class="relative card p-6 sm:p-8 w-full max-w-md animate-fade-in-up">
          <h3 class="text-lg font-display text-gray-900 dark:text-white mb-1">Garanti Onayla</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span class="font-mono font-medium">{{ warranty.serialNumber }}</span> icin garanti onaylaniyor
          </p>

          <div v-if="error" class="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            {{ error }}
          </div>

          <form @submit.prevent="handleApprove" class="space-y-4">
            <div>
              <label class="label">Garanti Baslangic Tarihi <span class="text-red-500">*</span></label>
              <input v-model="warrantyStartDate" type="date" class="input" required :disabled="loading" />
            </div>

            <div>
              <label class="label">Fatura Tarihi</label>
              <input v-model="invoiceDate" type="date" class="input" :disabled="loading" />
            </div>

            <div>
              <label class="label">Fatura Numarasi</label>
              <input v-model="invoiceNumber" type="text" class="input" placeholder="Opsiyonel" :disabled="loading" />
            </div>

            <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              <span>Bu islemi geri alamazsiniz.</span>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="emit('close')" class="btn-secondary flex-1" :disabled="loading">
                Iptal
              </button>
              <button type="submit" :disabled="!warrantyStartDate || loading" class="btn flex-1 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 focus:ring-emerald-500">
                <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-else>Onayla</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
