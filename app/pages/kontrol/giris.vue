<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({ title: 'Yönetici Girişi | FxGaranti' })
useSeoMeta({ robots: 'noindex, nofollow' })

const adminStore = useAdminStore()
const router = useRouter()
const { login } = useAdminApi()
const { trackEvent } = useTracking()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

onMounted(() => {
  adminStore.hydrateFromStorage()
  if (adminStore.isAuthenticated) {
    router.replace('/kontrol')
  }
})

const handleLogin = async () => {
  if (!username.value.trim() || !password.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await login({ username: username.value.trim(), password: password.value })
    trackEvent('admin-login-success')
    router.push('/kontrol')
  } catch (err: any) {
    const message = err.response?.data?.message
    if (err.response?.status === 401) {
      errorMessage.value = 'Kullanici adi veya sifre hatali.'
      trackEvent('admin-login-fail', { reason: 'invalid_credentials' })
    } else if (typeof message === 'string' && message.length < 200) {
      errorMessage.value = message
      trackEvent('admin-login-fail', { reason: 'server_error' })
    } else {
      errorMessage.value = 'Giris yapilamadi. Lutfen tekrar deneyin.'
      trackEvent('admin-login-fail', { reason: 'server_error' })
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center gradient-mesh pattern-grid px-4">
    <!-- Decorative Elements -->
    <div class="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-accent/8 rounded-full blur-3xl"></div>

    <div class="w-full max-w-md animate-fade-in-up">
      <div class="card p-8 sm:p-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 mb-5">
            <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl font-display text-gray-900 dark:text-white mb-1">
            <span class="gradient-text">FxGaranti</span> Kontrol Paneli
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Yetkili giris</p>
        </div>

        <!-- Error -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="errorMessage" role="alert" class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p class="text-sm text-red-700 dark:text-red-300">{{ errorMessage }}</p>
            </div>
          </div>
        </Transition>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="label">Kullanici Adi</label>
            <input
              v-model="username"
              type="text"
              class="input"
              placeholder="admin"
              autocomplete="username"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label class="label">Sifre</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="input pr-12"
                placeholder="••••••••"
                autocomplete="current-password"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="!username.trim() || !password || isLoading"
            class="btn-primary w-full"
          >
            <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>Giris Yap</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
