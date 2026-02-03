<script setup lang="ts">
import type { CreateWarrantyDto, IdentifierType } from '~/types'

const router = useRouter()
const authStore = useAuthStore()
const warrantyStore = useWarrantyStore()

const step = ref<'form' | 'auth' | 'success'>('form')
const loading = ref(false)
const error = ref('')
const verificationMethod = ref<IdentifierType>('phone')

const form = reactive<CreateWarrantyDto>({
  serialNumber: '',
  deviceModel: '',
  firstName: '',
  lastName: '',
  identityNumber: '',
  email: '',
  phone: '',
  invoiceNumber: '',
  invoiceDate: '',
  warrantyStartDate: new Date().toISOString().split('T')[0],
  warrantyDurationMonths: 24
})

const createdWarranty = ref<any>(null)

const isFormValid = computed(() => {
  return (
    form.serialNumber.trim() &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.warrantyStartDate
  )
})

const handleFormSubmit = () => {
  if (!isFormValid.value) return
  error.value = ''

  // OTP doğrulama için identifier'ı ayarla
  const identifier = verificationMethod.value === 'phone' ? form.phone : form.email
  authStore.setOtpContext(identifier, verificationMethod.value, 'warranty_register')

  step.value = 'auth'
}

const handleAuthSuccess = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await warrantyStore.createWarranty(form)
    createdWarranty.value = result
    step.value = 'success'
  } catch (err: any) {
    if (err.response?.status === 409) {
      error.value = 'Bu seri numarası zaten kayıtlı.'
    } else {
      error.value = err.response?.data?.message || 'Garanti kaydı oluşturulamadı. Lütfen tekrar deneyin.'
    }
    step.value = 'form'
  } finally {
    loading.value = false
  }
}

const handleAuthCancel = () => {
  step.value = 'form'
}

const formatTcKimlik = (value: string) => {
  return value.replace(/\D/g, '').slice(0, 11)
}

const formatPhone = (value: string) => {
  return value.replace(/\D/g, '').slice(0, 10)
}

watch(() => form.identityNumber, (val) => {
  form.identityNumber = formatTcKimlik(val || '')
})

watch(() => form.phone, (val) => {
  form.phone = formatPhone(val || '')
})
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />

    <main class="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <!-- Progress Steps -->
        <div class="mb-12">
          <div class="flex items-center justify-center gap-4">
            <div class="flex items-center gap-2">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300"
                :class="step === 'form'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'"
              >
                <svg v-if="step !== 'form'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>1</span>
              </div>
              <span class="text-sm font-medium hidden sm:inline" :class="step === 'form' ? 'text-gray-900 dark:text-white' : 'text-gray-500'">Bilgiler</span>
            </div>

            <div class="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" :class="{ 'bg-primary-500': step !== 'form' }"></div>

            <div class="flex items-center gap-2">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300"
                :class="step === 'auth'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : step === 'success'
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800'"
              >
                <svg v-if="step === 'success'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>2</span>
              </div>
              <span class="text-sm font-medium hidden sm:inline" :class="step === 'auth' ? 'text-gray-900 dark:text-white' : 'text-gray-500'">Doğrulama</span>
            </div>

            <div class="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" :class="{ 'bg-primary-500': step === 'success' }"></div>

            <div class="flex items-center gap-2">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300"
                :class="step === 'success'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-800'"
              >
                <svg v-if="step === 'success'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>3</span>
              </div>
              <span class="text-sm font-medium hidden sm:inline" :class="step === 'success' ? 'text-gray-900 dark:text-white' : 'text-gray-500'">Tamamlandı</span>
            </div>
          </div>
        </div>

        <!-- Steps Content -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-4"
          mode="out-in"
        >
          <!-- Step 1: Registration Form -->
          <div v-if="step === 'form'" class="card p-8">
            <div class="text-center mb-8">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 class="text-2xl font-display text-gray-900 dark:text-white">Garanti Bilgileri</h2>
              <p class="text-gray-500 dark:text-gray-400 mt-2">Cihaz ve kişisel bilgilerinizi girin</p>
            </div>

            <form @submit.prevent="handleFormSubmit" class="space-y-6">
              <!-- Device Info -->
              <div class="space-y-4">
                <h3 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Cihaz Bilgileri
                </h3>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="label">Seri Numarası <span class="text-red-500">*</span></label>
                    <input v-model="form.serialNumber" type="text" class="input" placeholder="SN123456789" />
                  </div>
                  <div>
                    <label class="label">Cihaz Modeli</label>
                    <input v-model="form.deviceModel" type="text" class="input" placeholder="iPhone 15 Pro" />
                  </div>
                </div>
              </div>

              <!-- Personal Info -->
              <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Kişisel Bilgiler
                </h3>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="label">Ad <span class="text-red-500">*</span></label>
                    <input v-model="form.firstName" type="text" class="input" placeholder="Ali" />
                  </div>
                  <div>
                    <label class="label">Soyad <span class="text-red-500">*</span></label>
                    <input v-model="form.lastName" type="text" class="input" placeholder="Yılmaz" />
                  </div>
                </div>

                <div>
                  <label class="label">TC Kimlik Numarası <span class="text-gray-400 text-xs">(Opsiyonel)</span></label>
                  <input v-model="form.identityNumber" type="text" class="input" placeholder="12345678901" maxlength="11" />
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="label">E-posta <span class="text-red-500">*</span></label>
                    <input v-model="form.email" type="email" class="input" placeholder="ali@example.com" />
                  </div>
                  <div>
                    <label class="label">Telefon <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">+90</span>
                      <input v-model="form.phone" type="text" class="input pl-14" placeholder="5XX XXX XX XX" maxlength="10" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Invoice Info -->
              <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Fatura Bilgileri
                  <span class="text-gray-400 text-xs font-normal">(Opsiyonel)</span>
                </h3>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="label">Fatura Numarası</label>
                    <input v-model="form.invoiceNumber" type="text" class="input" placeholder="INV-001" />
                  </div>
                  <div>
                    <label class="label">Fatura Tarihi</label>
                    <input v-model="form.invoiceDate" type="date" class="input" />
                  </div>
                </div>
              </div>

              <!-- Warranty Info -->
              <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Garanti Bilgileri
                </h3>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="label">Garanti Başlangıç Tarihi <span class="text-red-500">*</span></label>
                    <input v-model="form.warrantyStartDate" type="date" class="input" />
                  </div>
                  <div>
                    <label class="label">Garanti Süresi</label>
                    <select v-model="form.warrantyDurationMonths" class="input">
                      <option :value="12">12 Ay</option>
                      <option :value="24">24 Ay</option>
                      <option :value="36">36 Ay</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Verification Method -->
              <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Doğrulama Yöntemi
                </h3>

                <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    type="button"
                    @click="verificationMethod = 'phone'"
                    class="flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all"
                    :class="verificationMethod === 'phone'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                  >
                    Telefon ile doğrula
                  </button>
                  <button
                    type="button"
                    @click="verificationMethod = 'email'"
                    class="flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all"
                    :class="verificationMethod === 'email'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                  >
                    E-posta ile doğrula
                  </button>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Doğrulama kodu
                  <span class="font-medium text-gray-700 dark:text-gray-300">
                    {{ verificationMethod === 'phone' ? form.phone || 'telefon numaranıza' : form.email || 'e-posta adresinize' }}
                  </span>
                  gönderilecektir.
                </p>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="flex gap-4 pt-4">
                <NuxtLink to="/" class="btn-secondary flex-1 text-center">
                  İptal
                </NuxtLink>
                <button
                  type="submit"
                  :disabled="!isFormValid"
                  class="btn-primary flex-1"
                >
                  Devam Et
                </button>
              </div>
            </form>
          </div>

          <!-- Step 2: Auth -->
          <div v-else-if="step === 'auth'" class="card p-8">
            <OtpVerification
              purpose="warranty_register"
              @success="handleAuthSuccess"
              @cancel="handleAuthCancel"
            />

            <!-- Loading overlay when submitting warranty -->
            <div v-if="loading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div class="text-center">
                <svg class="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="text-gray-600 dark:text-gray-400">Garanti kaydı oluşturuluyor...</p>
              </div>
            </div>
          </div>

          <!-- Step 3: Success -->
          <div v-else-if="step === 'success'" class="card p-8 text-center">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg class="w-10 h-10 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 class="text-2xl font-display text-gray-900 dark:text-white mb-2">Garanti Kaydı Oluşturuldu!</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-8">Cihazınız başarıyla garanti kapsamına alındı.</p>

            <div v-if="createdWarranty" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-8 text-left">
              <div class="grid gap-4">
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Seri Numarası</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ createdWarranty.serialNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Garanti Başlangıcı</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ new Date(createdWarranty.warrantyStartDate).toLocaleDateString('tr-TR') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Garanti Bitişi</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ new Date(createdWarranty.warrantyEndDate).toLocaleDateString('tr-TR') }}</span>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              <NuxtLink :to="`/garanti/${createdWarranty?.serialNumber}`" class="btn-primary flex-1">
                Garanti Detaylarını Gör
              </NuxtLink>
              <NuxtLink to="/" class="btn-secondary flex-1">
                Ana Sayfaya Dön
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>
