<script setup lang="ts">
import type { AdminWarranty } from '~/types/admin'

const props = defineProps<{
  warranty: AdminWarranty
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  rejected: [warranty: AdminWarranty]
}>()

const { rejectWarranty } = useAdminApi()

const reason = ref('')
const loading = ref(false)
const error = ref('')

watch(() => props.open, (val) => {
  if (val) {
    reason.value = ''
    error.value = ''
  }
})

const charCount = computed(() => reason.value.length)
const isValid = computed(() => charCount.value >= 1 && charCount.value <= 500)

const handleReject = async () => {
  if (!isValid.value) return

  loading.value = true
  error.value = ''

  try {
    const result = await rejectWarranty(props.warranty.serialNumber, {
      reason: reason.value.trim()
    })
    emit('rejected', result)
    emit('close')
  } catch (err: any) {
    const message = err.response?.data?.message
    error.value = (typeof message === 'string' && message.length < 200) ? message : 'Red islemi basarisiz oldu.'
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
          <h3 class="text-lg font-display text-gray-900 dark:text-white mb-1">Basvuruyu Reddet</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span class="font-mono font-medium">{{ warranty.serialNumber }}</span> icin basvuru reddediliyor
          </p>

          <div v-if="error" class="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            {{ error }}
          </div>

          <form @submit.prevent="handleReject" class="space-y-4">
            <div>
              <label class="label">Red Sebebi <span class="text-red-500">*</span></label>
              <textarea
                v-model="reason"
                rows="4"
                class="input resize-none"
                placeholder="Red sebebini yaziniz..."
                maxlength="500"
                :disabled="loading"
              ></textarea>
              <div class="flex justify-end mt-1">
                <span class="text-xs" :class="charCount > 500 ? 'text-red-500' : 'text-gray-400'">
                  {{ charCount }}/500
                </span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              <span>Musteriye SMS ve e-posta bildirimi gonderilecektir.</span>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="emit('close')" class="btn-secondary flex-1" :disabled="loading">
                Iptal
              </button>
              <button type="submit" :disabled="!isValid || loading" class="btn flex-1 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/25 focus:ring-red-500">
                <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-else>Reddet</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
