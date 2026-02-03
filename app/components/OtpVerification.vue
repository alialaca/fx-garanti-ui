<script setup lang="ts">
import type { IdentifierType, OtpPurpose } from '~/types'

const props = defineProps<{
  purpose: OtpPurpose
  onSuccess?: () => void
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const { requestOtp, verifyOtp } = useApi()
const authStore = useAuthStore()

const step = ref<'identifier' | 'otp'>('identifier')
const identifierType = ref<IdentifierType>('phone')
const identifier = ref('')
const otpCode = ref('')
const loading = ref(false)
const error = ref('')
const countdown = ref(0)
const initialOtpSent = ref(false)

let countdownInterval: ReturnType<typeof setInterval> | null = null

const identifierLabel = computed(() => {
  return identifierType.value === 'phone' ? 'Telefon Numarası' : 'E-posta Adresi'
})

const identifierPlaceholder = computed(() => {
  return identifierType.value === 'phone' ? '5XX XXX XX XX' : 'ornek@email.com'
})

const isIdentifierValid = computed(() => {
  if (identifierType.value === 'phone') {
    return /^5\d{9}$/.test(identifier.value.replace(/\s/g, ''))
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.value)
})

const isOtpValid = computed(() => {
  return /^\d{6}$/.test(otpCode.value)
})

const startCountdown = () => {
  countdown.value = 60
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && countdownInterval) {
      clearInterval(countdownInterval)
    }
  }, 1000)
}

const sendOtp = async (targetIdentifier: string, targetIdentifierType: IdentifierType) => {
  loading.value = true
  error.value = ''

  try {
    await requestOtp({
      identifier: targetIdentifier,
      identifierType: targetIdentifierType,
      purpose: props.purpose
    })

    authStore.setOtpContext(targetIdentifier, targetIdentifierType, props.purpose)
    step.value = 'otp'
    startCountdown()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'OTP gönderilemedi. Lütfen tekrar deneyin.'
    // Eğer otomatik gönderim başarısız olursa identifier adımına dön
    if (initialOtpSent.value) {
      step.value = 'identifier'
      identifier.value = targetIdentifier
      identifierType.value = targetIdentifierType
    }
  } finally {
    loading.value = false
  }
}

const handleRequestOtp = async () => {
  if (!isIdentifierValid.value) return

  const cleanIdentifier = identifierType.value === 'phone'
    ? identifier.value.replace(/\s/g, '')
    : identifier.value

  await sendOtp(cleanIdentifier, identifierType.value)
}

const handleVerifyOtp = async () => {
  if (!isOtpValid.value) return

  loading.value = true
  error.value = ''

  try {
    await verifyOtp({
      identifier: authStore.identifier!,
      identifierType: authStore.identifierType!,
      otpCode: otpCode.value,
      purpose: props.purpose
    })

    emit('success')
    props.onSuccess?.()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'OTP doğrulanamadı. Lütfen tekrar deneyin.'
  } finally {
    loading.value = false
  }
}

const handleResendOtp = async () => {
  if (countdown.value > 0) return

  if (authStore.identifier && authStore.identifierType) {
    await sendOtp(authStore.identifier, authStore.identifierType)
  }
}

const handleBack = () => {
  // Eğer identifier daha önce set edilmişse (kayıt sayfasından geldiyse) iptal et
  if (initialOtpSent.value) {
    emit('cancel')
    return
  }

  step.value = 'identifier'
  otpCode.value = ''
  error.value = ''
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
}

// Component mount olduğunda, eğer authStore'da identifier varsa otomatik OTP gönder
onMounted(async () => {
  if (authStore.identifier && authStore.identifierType && authStore.purpose === props.purpose) {
    initialOtpSent.value = true
    await sendOtp(authStore.identifier, authStore.identifierType)
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Step 1: Identifier Input -->
    <div v-if="step === 'identifier'" class="space-y-6">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Kimlik Doğrulama</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Devam etmek için telefon veya e-posta adresinizi girin</p>
      </div>

      <!-- Identifier Type Tabs -->
      <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          @click="identifierType = 'phone'"
          class="flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all"
          :class="identifierType === 'phone'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
        >
          Telefon
        </button>
        <button
          @click="identifierType = 'email'"
          class="flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all"
          :class="identifierType === 'email'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
        >
          E-posta
        </button>
      </div>

      <!-- Input Field -->
      <div>
        <label class="label">{{ identifierLabel }}</label>
        <input
          v-model="identifier"
          type="text"
          :placeholder="identifierPlaceholder"
          class="input"
          :class="{ 'input-error': error }"
          @keyup.enter="handleRequestOtp"
        />
      </div>

      <!-- Error Message -->
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <!-- Submit Button -->
      <button
        @click="handleRequestOtp"
        :disabled="!isIdentifierValid || loading"
        class="btn-primary w-full"
      >
        <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-else>Doğrulama Kodu Gönder</span>
      </button>

      <button @click="emit('cancel')" class="btn-secondary w-full">
        İptal
      </button>
    </div>

    <!-- Step 2: OTP Input -->
    <div v-else class="space-y-6">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Doğrulama Kodu</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          <span class="font-medium text-gray-900 dark:text-white">{{ authStore.identifier }}</span>
          adresine gönderilen 6 haneli kodu girin
        </p>
      </div>

      <!-- OTP Input -->
      <div>
        <label class="label">Doğrulama Kodu</label>
        <input
          v-model="otpCode"
          type="text"
          maxlength="6"
          placeholder="000000"
          class="input text-center text-2xl tracking-[0.5em] font-mono"
          :class="{ 'input-error': error }"
          @keyup.enter="handleVerifyOtp"
        />
      </div>

      <!-- Error Message -->
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <!-- Resend Link -->
      <p class="text-center text-sm text-gray-500 dark:text-gray-400">
        Kod gelmedi mi?
        <button
          @click="handleResendOtp"
          :disabled="countdown > 0"
          class="font-medium text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          {{ countdown > 0 ? `Tekrar gönder (${countdown}s)` : 'Tekrar gönder' }}
        </button>
      </p>

      <!-- Buttons -->
      <button
        @click="handleVerifyOtp"
        :disabled="!isOtpValid || loading"
        class="btn-primary w-full"
      >
        <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-else>Doğrula</span>
      </button>

      <button @click="handleBack" class="btn-secondary w-full">
        {{ initialOtpSent ? 'Geri Dön' : 'Geri Dön' }}
      </button>
    </div>
  </div>
</template>
