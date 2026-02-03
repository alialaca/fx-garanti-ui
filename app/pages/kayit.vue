<script setup lang="ts">
import type { CreateWarrantyDto, IdentifierType } from '~/types'

const router = useRouter()
const authStore = useAuthStore()
const warrantyStore = useWarrantyStore()

const step = ref<'form' | 'auth' | 'success'>('form')
const loading = ref(false)
const error = ref('')
const verificationMethod = ref<IdentifierType>('phone')

const form = reactive<Omit<CreateWarrantyDto, 'warrantyStartDate' | 'warrantyDurationMonths' | 'invoiceDate' | 'invoiceNumber'>>({
  serialNumber: '',
  deviceModel: '',
  firstName: '',
  lastName: '',
  identityNumber: '',
  email: '',
  phone: '',
  invoiceImageUrl: ''
})

const invoiceFile = ref<File | null>(null)
const invoicePreview = ref<string | null>(null)
const uploadingFile = ref(false)

const createdWarranty = ref<any>(null)

const isFormValid = computed(() => {
  return (
    form.serialNumber.trim() &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phone.trim()
  )
})

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    error.value = 'Sadece JPG, PNG, WebP veya PDF dosyaları yüklenebilir.'
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Dosya boyutu 5MB\'dan küçük olmalıdır.'
    return
  }

  error.value = ''
  invoiceFile.value = file

  // Create preview for images
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      invoicePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    invoicePreview.value = null
  }
}

const removeFile = () => {
  invoiceFile.value = null
  invoicePreview.value = null
  form.invoiceImageUrl = ''
}

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
    // TODO: Upload file to server and get URL
    // For now, we'll skip file upload and just create the warranty
    // In production, you would upload the file first:
    // if (invoiceFile.value) {
    //   const formData = new FormData()
    //   formData.append('file', invoiceFile.value)
    //   const uploadResponse = await uploadFile(formData)
    //   form.invoiceImageUrl = uploadResponse.url
    // }

    const result = await warrantyStore.createWarranty(form as CreateWarrantyDto)
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
              <h2 class="text-2xl font-display text-gray-900 dark:text-white">Garanti Kaydı</h2>
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

              <!-- Invoice Upload -->
              <div class="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 class="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <svg class="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Fatura
                  <span class="text-gray-400 text-xs font-normal">(Opsiyonel)</span>
                </h3>

                <!-- File Upload Area -->
                <div v-if="!invoiceFile" class="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    @change="handleFileSelect"
                  />
                  <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                    <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span class="font-medium text-primary-600 dark:text-primary-400">Dosya seçin</span> veya sürükleyip bırakın
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">
                      JPG, PNG, WebP veya PDF (Maks. 5MB)
                    </p>
                  </div>
                </div>

                <!-- File Preview -->
                <div v-else class="relative border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div class="flex items-start gap-4">
                    <!-- Image Preview -->
                    <div v-if="invoicePreview" class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      <img :src="invoicePreview" alt="Fatura önizleme" class="w-full h-full object-cover" />
                    </div>
                    <!-- PDF Icon -->
                    <div v-else class="w-20 h-20 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <!-- File Info -->
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 dark:text-white truncate">{{ invoiceFile.name }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ (invoiceFile.size / 1024).toFixed(1) }} KB
                      </p>
                    </div>

                    <!-- Remove Button -->
                    <button
                      type="button"
                      @click="removeFile"
                      class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
          <div v-else-if="step === 'auth'" class="card p-8 relative">
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
                <div v-if="createdWarranty.deviceModel" class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Cihaz Modeli</span>
                  <span class="font-medium text-gray-900 dark:text-white">{{ createdWarranty.deviceModel }}</span>
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
