<script setup lang="ts">
import type { WarrantyAuthInfo } from '~/types'

const router = useRouter()
const authStore = useAuthStore()
const { getWarrantyAuthInfo } = useApi()

const serialNumber = ref('')
const showOtpModal = ref(false)
const isSearching = ref(false)
const searchError = ref('')
const warrantyAuthInfo = ref<WarrantyAuthInfo | null>(null)

const handleSearch = async () => {
  if (!serialNumber.value.trim()) return

  isSearching.value = true
  searchError.value = ''
  warrantyAuthInfo.value = null

  try {
    // Önce cihazın kayıtlı iletişim bilgilerini al
    const authInfo = await getWarrantyAuthInfo(serialNumber.value.trim())
    warrantyAuthInfo.value = authInfo
    showOtpModal.value = true
  } catch (err: any) {
    if (err.response?.status === 404) {
      searchError.value = 'Bu seri numarasina ait garanti kaydi bulunamadi.'
    } else if (err.response?.status === 502 || err.response?.status === 503) {
      searchError.value = 'Servis gecici olarak kullanilamiyor. Lutfen daha sonra tekrar deneyin.'
    } else {
      const message = err.response?.data?.message
      searchError.value = (typeof message === 'string' && message.length < 100)
        ? message
        : 'Bir hata olustu. Lutfen tekrar deneyin.'
    }
  } finally {
    isSearching.value = false
  }
}

const handleOtpSuccess = async () => {
  showOtpModal.value = false
  warrantyAuthInfo.value = null

  try {
    await router.push(`/garanti/${serialNumber.value}`)
  } catch {
    // Navigation error handling
  }
}

const handleOtpCancel = () => {
  showOtpModal.value = false
  warrantyAuthInfo.value = null
}

const coverageItems = [
  {
    icon: 'shield',
    title: 'Fabrikasyon Hataları',
    description: 'Üretim kaynaklı tüm kusur ve arızalar garanti kapsamındadır.'
  },
  {
    icon: 'cpu',
    title: 'Donanım Arızaları',
    description: 'Anakart, işlemci, bellek ve diğer donanım bileşeni arızaları.'
  },
  {
    icon: 'battery',
    title: 'Batarya Sorunları',
    description: 'Normal kullanımda yaşanan batarya performans düşüşleri.'
  },
  {
    icon: 'screen',
    title: 'Ekran Kusurları',
    description: 'Piksel hataları ve dokunmatik ekran arızaları.'
  }
]

const exclusions = [
  'Fiziksel hasar ve kırıklar',
  'Sıvı teması sonucu oluşan arızalar',
  'Yetkisiz teknik müdahale',
  'Doğal afetler ve yangın hasarları'
]
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <!-- Decorative Elements -->
      <div class="absolute top-20 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -z-10"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10"></div>

      <div class="max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <!-- Left Content -->
          <div class="space-y-8">
            <div class="animate-fade-in-up">
              <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
                <span class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                Hızlı ve Güvenilir
              </span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-display text-gray-900 dark:text-white leading-tight animate-fade-in-up animate-delay-100">
              Cihaz Garantinizi
              <span class="gradient-text block">Kolayca Yönetin</span>
            </h1>

            <p class="text-lg text-gray-600 dark:text-gray-400 max-w-lg animate-fade-in-up animate-delay-200">
              Cihazınızın garanti durumunu anında sorgulayın, yeni garanti kaydı oluşturun. Tüm garanti işlemleriniz tek bir platformda.
            </p>

            <!-- Search Form -->
            <div class="animate-fade-in-up animate-delay-300">
              <div class="card p-2 flex flex-col sm:flex-row gap-3" :class="{ 'ring-2 ring-red-500': searchError }">
                <div class="flex-1 relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    v-model="serialNumber"
                    type="text"
                    placeholder="Seri numarasi girin..."
                    class="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0"
                    @keyup.enter="handleSearch"
                    @input="searchError = ''"
                  />
                </div>
                <button
                  @click="handleSearch"
                  :disabled="!serialNumber.trim() || isSearching"
                  class="btn-primary px-8 whitespace-nowrap"
                >
                  <svg v-if="isSearching" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span v-else>Garanti Sorgula</span>
                </button>
              </div>
              <!-- Error Message -->
              <p v-if="searchError" class="mt-3 text-sm text-red-600 dark:text-red-400">
                {{ searchError }}
              </p>
            </div>

            <!-- Quick Stats -->
            <div class="flex flex-wrap gap-8 pt-4 animate-fade-in-up animate-delay-400">
              <div>
                <div class="text-3xl font-display text-gray-900 dark:text-white">50K+</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Kayıtlı Cihaz</div>
              </div>
              <div>
                <div class="text-3xl font-display text-gray-900 dark:text-white">24 Ay</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Garanti Süresi</div>
              </div>
              <div>
                <div class="text-3xl font-display text-gray-900 dark:text-white">7/24</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">Destek</div>
              </div>
            </div>
          </div>

          <!-- Right Illustration -->
          <div class="hidden lg:flex justify-center animate-fade-in-up animate-delay-300">
            <div class="relative">
              <!-- Main Card -->
              <div class="card p-8 w-80">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Garanti Durumu</div>
                    <div class="font-display text-xl text-gray-900 dark:text-white">Aktif</div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                    <span class="text-gray-500 dark:text-gray-400">Cihaz</span>
                    <span class="font-medium text-gray-900 dark:text-white">iPhone 15 Pro</span>
                  </div>
                  <div class="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                    <span class="text-gray-500 dark:text-gray-400">Bitiş Tarihi</span>
                    <span class="font-medium text-gray-900 dark:text-white">15 Ocak 2026</span>
                  </div>
                  <div class="flex justify-between items-center py-3">
                    <span class="text-gray-500 dark:text-gray-400">Kalan Süre</span>
                    <span class="font-medium text-emerald-600 dark:text-emerald-400">11 ay 25 gün</span>
                  </div>
                </div>
              </div>

              <!-- Floating Badge -->
              <div class="absolute -top-4 -right-4 card px-4 py-2 flex items-center gap-2 animate-bounce">
                <div class="w-3 h-3 rounded-full bg-emerald-500 pulse-dot active"></div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Güvende</span>
              </div>

              <!-- Background Decoration -->
              <div class="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Coverage Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-display text-gray-900 dark:text-white mb-4">
            Garanti Kapsamı
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Cihazınız için sunduğumuz kapsamlı garanti koruması
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(item, index) in coverageItems"
            :key="item.title"
            class="card-hover p-6 animate-fade-in-up"
            :class="`animate-delay-${(index + 1) * 100}`"
          >
            <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
              <!-- Shield Icon -->
              <svg v-if="item.icon === 'shield'" class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <!-- CPU Icon -->
              <svg v-else-if="item.icon === 'cpu'" class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <!-- Battery Icon -->
              <svg v-else-if="item.icon === 'battery'" class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
              </svg>
              <!-- Screen Icon -->
              <svg v-else-if="item.icon === 'screen'" class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="font-display text-lg text-gray-900 dark:text-white mb-2">{{ item.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.description }}</p>
          </div>
        </div>

        <!-- Exclusions -->
        <div class="mt-16 card p-8">
          <div class="flex flex-col lg:flex-row gap-8">
            <div class="lg:w-1/3">
              <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 class="font-display text-xl text-gray-900 dark:text-white mb-2">Kapsam Dışı Durumlar</h3>
              <p class="text-gray-600 dark:text-gray-400">Aşağıdaki durumlar garanti kapsamı dışındadır.</p>
            </div>
            <div class="lg:w-2/3">
              <ul class="grid sm:grid-cols-2 gap-4">
                <li v-for="exclusion in exclusions" :key="exclusion" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span class="text-gray-700 dark:text-gray-300">{{ exclusion }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="card p-12 text-center relative overflow-hidden">
          <!-- Background Gradient -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 opacity-[0.03] dark:opacity-10"></div>

          <div class="relative">
            <h2 class="text-3xl sm:text-4xl font-display text-gray-900 dark:text-white mb-4">
              Yeni Cihaz mı Aldınız?
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Cihazınızı hemen kaydedin ve 24 aya kadar uzatılmış garanti avantajlarından yararlanın.
            </p>
            <NuxtLink to="/kayit" class="btn-primary px-8 py-4 text-lg">
              Garanti Kaydı Oluştur
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span class="font-display text-lg"><span class="text-primary dark:text-primary-400">Fx</span><span class="text-gray-900 dark:text-white">Garanti</span></span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ new Date().getFullYear() }} FxGaranti. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>

    <!-- OTP Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showOtpModal && warrantyAuthInfo" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="handleOtpCancel"></div>

          <!-- Modal -->
          <div class="relative card p-8 w-full max-w-md animate-fade-in-up">
            <button
              @click="handleOtpCancel"
              class="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <OtpVerification
              purpose="warranty_query"
              :serial-number="serialNumber.trim()"
              :auth-info="warrantyAuthInfo"
              @success="handleOtpSuccess"
              @cancel="handleOtpCancel"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
