<script setup lang="ts">
import type { IdentifierType, OtpPurpose, WarrantyAuthInfo } from '~/types'

const props = defineProps<{
  purpose: OtpPurpose
  serialNumber?: string           // warranty_query için
  authInfo?: WarrantyAuthInfo     // Maskelenmiş iletişim bilgileri
  onSuccess?: () => void
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const { requestOtp, verifyOtp } = useApi()
const authStore = useAuthStore()

// warranty_query için step: 'select' -> 'otp'
// warranty_register için step: 'identifier' -> 'otp'
const step = ref<'identifier' | 'select' | 'otp'>('identifier')
const identifierType = ref<IdentifierType>('phone')
const identifier = ref('')
const otpCode = ref('')
const loading = ref(false)
const error = ref('')
const countdown = ref(0)
const initialOtpSent = ref(false)

let countdownInterval: ReturnType<typeof setInterval> | null = null

// warranty_query modunda mı?
const isQueryMode = computed(() => props.purpose === 'warranty_query' && props.authInfo)

// Seçilen iletişim bilgisinin maskelenmiş hali
const selectedMaskedIdentifier = computed(() => {
  if (!props.authInfo) return ''
  return identifierType.value === 'phone' ? props.authInfo.maskedPhone : props.authInfo.maskedEmail
})

// Sadece tek seçenek mi var?
const hasSingleOption = computed(() => {
  if (!props.authInfo) return false
  return (props.authInfo.hasPhone && !props.authInfo.hasEmail) ||
         (!props.authInfo.hasPhone && props.authInfo.hasEmail)
})

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

// warranty_register için OTP gönderme
const sendOtpForRegister = async (targetIdentifier: string, targetIdentifierType: IdentifierType) => {
  loading.value = true
  error.value = ''

  try {
    await requestOtp({
      identifier: targetIdentifier,
      identifierType: targetIdentifierType,
      purpose: 'warranty_register'
    })

    authStore.setOtpContext(targetIdentifier, targetIdentifierType, 'warranty_register')
    step.value = 'otp'
    startCountdown()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'OTP gönderilemedi. Lütfen tekrar deneyin.'
    if (initialOtpSent.value) {
      step.value = 'identifier'
      identifier.value = targetIdentifier
      identifierType.value = targetIdentifierType
    }
  } finally {
    loading.value = false
  }
}

// warranty_query için OTP gönderme (serialNumber ile)
const sendOtpForQuery = async () => {
  if (!props.serialNumber || !props.authInfo) return

  loading.value = true
  error.value = ''

  try {
    const response = await requestOtp({
      serialNumber: props.serialNumber,
      identifierType: identifierType.value,
      purpose: 'warranty_query'
    })

    const maskedIdentifier = response.maskedIdentifier || selectedMaskedIdentifier.value || ''
    authStore.setOtpContextForQuery(props.serialNumber, identifierType.value, maskedIdentifier)
    step.value = 'otp'
    startCountdown()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'OTP gönderilemedi. Lütfen tekrar deneyin.'
  } finally {
    loading.value = false
  }
}

const handleRequestOtp = async () => {
  if (isQueryMode.value) {
    await sendOtpForQuery()
  } else {
    if (!isIdentifierValid.value) return
    const cleanIdentifier = identifierType.value === 'phone'
      ? identifier.value.replace(/\s/g, '')
      : identifier.value
    await sendOtpForRegister(cleanIdentifier, identifierType.value)
  }
}

const handleVerifyOtp = async () => {
  if (!isOtpValid.value) return

  loading.value = true
  error.value = ''

  try {
    if (isQueryMode.value && props.serialNumber) {
      // warranty_query için serialNumber ile doğrulama
      await verifyOtp({
        serialNumber: props.serialNumber,
        otpCode: otpCode.value,
        purpose: 'warranty_query'
      })
    } else {
      // warranty_register için identifier ile doğrulama
      await verifyOtp({
        identifier: authStore.identifier!,
        identifierType: authStore.identifierType!,
        otpCode: otpCode.value,
        purpose: 'warranty_register'
      })
    }

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

  if (isQueryMode.value) {
    await sendOtpForQuery()
  } else if (authStore.identifier && authStore.identifierType) {
    await sendOtpForRegister(authStore.identifier, authStore.identifierType)
  }
}

const handleBack = () => {
  if (isQueryMode.value) {
    // warranty_query modunda geri dönüş: select adımına veya iptal
    if (step.value === 'otp' && !hasSingleOption.value) {
      step.value = 'select'
      otpCode.value = ''
      error.value = ''
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
      return
    }
  } else {
    // warranty_register modunda
    if (initialOtpSent.value) {
      emit('cancel')
      return
    }
    if (step.value === 'otp') {
      step.value = 'identifier'
      otpCode.value = ''
      error.value = ''
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
      return
    }
  }

  emit('cancel')
}

// Component mount olduğunda
onMounted(async () => {
  if (isQueryMode.value && props.authInfo) {
    // warranty_query modunda: Varsayılan seçeneği belirle
    if (props.authInfo.hasPhone) {
      identifierType.value = 'phone'
    } else if (props.authInfo.hasEmail) {
      identifierType.value = 'email'
    }

    // Tek seçenek varsa direkt select adımını atla, OTP gönder
    if (hasSingleOption.value) {
      step.value = 'select'
      // Kısa bir gecikme ile OTP gönder (UI'ın render olması için)
      await nextTick()
      await sendOtpForQuery()
    } else {
      // Her iki seçenek de varsa, seçim adımını göster
      step.value = 'select'
    }
  } else if (authStore.identifier && authStore.identifierType && authStore.purpose === props.purpose) {
    // warranty_register için otomatik OTP gönderimi
    initialOtpSent.value = true
    await sendOtpForRegister(authStore.identifier, authStore.identifierType)
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
    <!-- Step 1: Identifier Input (warranty_register için) -->
    <div v-if="step === 'identifier' && !isQueryMode" class="space-y-6">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Kimlik Dogrulama</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Devam etmek icin telefon veya e-posta adresinizi girin</p>
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
        <span v-else>Dogrulama Kodu Gonder</span>
      </button>

      <button @click="emit('cancel')" class="btn-secondary w-full">
        Iptal
      </button>
    </div>

    <!-- Step 1 (Query Mode): Select Contact Method -->
    <div v-else-if="step === 'select' && isQueryMode && authInfo" class="space-y-6">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Cihaz Sahibi Dogrulamasi</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Garanti bilgilerini goruntulemek icin cihaz sahibine dogrulama kodu gonderilecektir</p>
      </div>

      <!-- Contact Type Selection (sadece her ikisi de varsa) -->
      <div v-if="authInfo.hasPhone && authInfo.hasEmail" class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          @click="identifierType = 'phone'"
          class="flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2"
          :class="identifierType === 'phone'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Telefon
        </button>
        <button
          @click="identifierType = 'email'"
          class="flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2"
          :class="identifierType === 'email'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          E-posta
        </button>
      </div>

      <!-- Masked Contact Info Display -->
      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Kod gonderilecek:</div>
        <div class="font-medium text-gray-900 dark:text-white text-lg">
          {{ selectedMaskedIdentifier }}
        </div>
      </div>

      <!-- Error Message -->
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

      <!-- Submit Button -->
      <button
        @click="handleRequestOtp"
        :disabled="loading"
        class="btn-primary w-full"
      >
        <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span v-else>Dogrulama Kodu Gonder</span>
      </button>

      <button @click="emit('cancel')" class="btn-secondary w-full">
        Iptal
      </button>
    </div>

    <!-- Step 2: OTP Input -->
    <div v-else-if="step === 'otp'" class="space-y-6">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Dogrulama Kodu</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          <span class="font-medium text-gray-900 dark:text-white">{{ authStore.identifier }}</span>
          adresine gonderilen 6 haneli kodu girin
        </p>
      </div>

      <!-- OTP Input -->
      <div>
        <label class="label">Dogrulama Kodu</label>
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
          {{ countdown > 0 ? `Tekrar gonder (${countdown}s)` : 'Tekrar gonder' }}
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
        <span v-else>Dogrula</span>
      </button>

      <button @click="handleBack" class="btn-secondary w-full">
        Geri Don
      </button>
    </div>
  </div>
</template>
