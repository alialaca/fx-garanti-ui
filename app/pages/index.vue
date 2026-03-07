<script setup lang="ts">
import type { WarrantyAuthInfo } from '~/types'
import dayjs from 'dayjs'
import 'dayjs/locale/tr'

const illustrationEndDate = computed(() =>
  dayjs().add(11, 'month').add(25, 'day').locale('tr').format('D MMMM YYYY')
)

useHead({
  title: 'Garanti Sorgula ve Kaydet | FxGaranti',
  link: [{ rel: 'canonical', href: 'https://garanti.fixpro.com.tr/' }]
})
useSeoMeta({
  description: 'FixPro cihazınızın garanti durumunu anında sorgulayın veya yeni garanti kaydı oluşturun. Hızlı, güvenli ve kolay garanti yönetimi.',
  ogTitle: 'FxGaranti - Cihaz Garanti Yönetim Sistemi',
  ogDescription: 'FixPro cihazınızın garanti durumunu anında sorgulayın veya yeni garanti kaydı oluşturun.',
  ogType: 'website',
  ogUrl: 'https://garanti.fixpro.com.tr/',
  twitterCard: 'summary',
  twitterTitle: 'FxGaranti - Cihaz Garanti Yönetim Sistemi',
  twitterDescription: 'FixPro cihazınızın garanti durumunu anında sorgulayın veya yeni garanti kaydı oluşturun.',
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'FixPro',
      url: 'https://fixpro.com.tr',
      logo: 'https://garanti.fixpro.com.tr/logo.png',
    })
  }]
})

const router = useRouter()
const authStore = useAuthStore()
const { getWarrantyAuthInfo } = useApi()
const { trackEvent } = useTracking()

const serialNumber = ref('')

const formatSerialNumber = (value: string) => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20)
}

watch(serialNumber, (val) => {
  serialNumber.value = formatSerialNumber(val || '')
})
const showOtpModal = ref(false)
const isSearching = ref(false)
const searchError = ref('')
const warrantyAuthInfo = ref<WarrantyAuthInfo | null>(null)

const handleSearch = async () => {
  if (!serialNumber.value.trim()) return

  trackEvent('search', { type: 'serial' })
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
    icon: 'cog',
    title: 'Ateşleme Mekanizması',
    description: 'Gaz veya hava ile çalışan ateşleme sistemi arızaları.'
  },
  {
    icon: 'trigger',
    title: 'Tetik ve Emniyet',
    description: 'Tetik mekanizması ve emniyet kilit sistemi sorunları.'
  },
  {
    icon: 'battery',
    title: 'Şarj Sistemi',
    description: 'Orijinal şarj aleti ve batarya performans sorunları.'
  }
]

const exclusions = [
  { icon: 'user', text: 'Ürünün yanlış kullanımından kaynaklı kullanıcı hatası sonucu oluşan hasarlar' },
  { icon: 'wrench', text: 'Ürünün tamirinin yetkili olmayan servisler tarafından yapılması' },
  { icon: 'cog', text: 'Üründe yetkisiz kişilerce yapılan modifikasyonlar ve değişiklikler' },
  { icon: 'nail', text: 'FixPro markası dışında başka marka çivi kullanmak' },
  { icon: 'flame', text: 'FixPro markası dışında başka marka gaz kullanmak' },
  { icon: 'plug', text: 'Kendisine ait şarj aleti dışında başka bir şarj aleti ile şarj etmeye çalışmak' },
  { icon: 'clock', text: 'Ürünün fazla kullanımından kaynaklı piston ve benzeri parçalarında oluşacak aşınma ve eskime' },
  { icon: 'cloud', text: 'Doğal afetler, yangın veya su baskını gibi dış faktörlerden kaynaklanan hasarlar' }
]

// Exclusions IntersectionObserver
const exclusionsRef = ref<HTMLElement | null>(null)
onMounted(() => {
  if (!exclusionsRef.value) return
  let tracked = false
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !tracked) {
      tracked = true
      trackEvent('exclusions-view')
      observer.disconnect()
    }
  }, { threshold: 0.3 })
  observer.observe(exclusionsRef.value)
})

const handleFooterLinkClick = (url: string, label: string) => {
  trackEvent('footer-link-click', { url, label })
}

const valuePropositions = [
  {
    icon: 'clipboard-list',
    title: 'Adım Adım Bilgilendirme',
    subtitle: 'Her aşamada yanınızdayız'
  },
  {
    icon: 'eye',
    title: 'Şeffaf Süreç',
    subtitle: 'Tüm süreci takip edin'
  },
  {
    icon: 'heart',
    title: 'Müşteri Odaklı',
    subtitle: 'Sizi yalnız bırakmıyoruz'
  }
]
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />

    <!-- Hero Section -->
    <section id="main-content" class="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
                    class="w-full pl-12 pr-4 py-4 bg-transparent border-0 text-gray-900 dark:text-white placeholder-gray-400 placeholder:normal-case focus:outline-none focus:ring-0 uppercase"
                    maxlength="20"
                    @keyup.enter="handleSearch"
                    @input="searchError = ''"
                  />
                </div>
                <button
                  @click="handleSearch"
                  :disabled="!serialNumber.trim() || isSearching"
                  class="btn-primary px-8 whitespace-nowrap"
                  :aria-label="isSearching ? 'Sorgulanıyor...' : 'Garanti Sorgula'"
                >
                  <svg v-if="isSearching" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" role="status" aria-label="Yükleniyor">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span v-else>Garanti Sorgula</span>
                </button>
              </div>
              <!-- Error Message -->
              <p v-if="searchError" role="alert" class="mt-3 text-sm text-red-600 dark:text-red-400">
                {{ searchError }}
              </p>
            </div>

            <!-- Value Propositions -->
            <div class="flex flex-wrap gap-6 pt-4 animate-fade-in-up animate-delay-400">
              <div
                v-for="item in valuePropositions"
                :key="item.title"
                class="flex items-center gap-3"
              >
                <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <!-- ClipboardList Icon -->
                  <svg v-if="item.icon === 'clipboard-list'" class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <!-- Eye Icon -->
                  <svg v-else-if="item.icon === 'eye'" class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <!-- Heart Icon -->
                  <svg v-else-if="item.icon === 'heart'" class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <div>
                  <div class="font-semibold text-gray-900 dark:text-white">{{ item.title }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ item.subtitle }}</div>
                </div>
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
                    <span class="font-medium text-gray-900 dark:text-white">FX165</span>
                  </div>
                  <div class="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                    <span class="text-gray-500 dark:text-gray-400">Bitiş Tarihi</span>
                    <span class="font-medium text-gray-900 dark:text-white">{{ illustrationEndDate }}</span>
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
              <!-- Cog Icon -->
              <svg v-else-if="item.icon === 'cog'" class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <!-- Trigger Icon (hand pointer) -->
              <svg v-else-if="item.icon === 'trigger'" class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <!-- Battery Icon -->
              <svg v-else-if="item.icon === 'battery'" class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
              </svg>
            </div>
            <h3 class="font-display text-lg text-gray-900 dark:text-white mb-2">{{ item.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.description }}</p>
          </div>
        </div>

        <!-- Exclusions -->
        <div ref="exclusionsRef" class="mt-16">
          <!-- Section Header -->
          <div class="flex items-center gap-4 mb-6">
            <div class="relative">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="absolute inset-0 rounded-2xl bg-amber-400 animate-ping opacity-20"></div>
            </div>
            <div>
              <h3 class="font-display text-xl text-gray-900 dark:text-white">Kapsam Dışı Durumlar</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Asagidaki durumlar garanti kapsaminda değildir</p>
            </div>
          </div>

          <!-- Items Grid -->
          <div class="grid sm:grid-cols-2 gap-3">
            <div
              v-for="exclusion in exclusions"
              :key="exclusion.text"
              class="group flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
            >
              <!-- Icon indicator -->
              <span class="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                <!-- User -->
                <svg v-if="exclusion.icon === 'user'" class="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <!-- Wrench -->
                <svg v-else-if="exclusion.icon === 'wrench'" class="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
                </svg>
                <!-- Cog -->
                <svg v-else-if="exclusion.icon === 'cog'" class="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <!-- Cloud -->
                <svg v-else-if="exclusion.icon === 'cloud'" class="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                </svg>
                <!-- Clock -->
                <svg v-else-if="exclusion.icon === 'clock'" class="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <!-- Nail -->
                <svg v-else-if="exclusion.icon === 'nail'" class="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                </svg>
                <!-- Flame -->
                <svg v-else-if="exclusion.icon === 'flame'" class="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                </svg>
                <!-- Plug -->
                <svg v-else-if="exclusion.icon === 'plug'" class="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" />
                </svg>
              </span>
              <span class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ exclusion.text }}</span>
            </div>
          </div>

          <!-- Footer note -->
          <p class="mt-5 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Detayli bilgi icin kullanim kilavuzuna basvurabilirsiniz.
          </p>
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
    <footer class="relative bg-gray-900 dark:bg-gray-950 overflow-hidden">
      <!-- Subtle gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-primary-900/20 pointer-events-none"></div>
      <!-- Subtle noise texture -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"></div>

      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Main Footer Content -->
        <div class="py-10 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 items-start">
          <!-- Brand Column -->
          <div class="flex flex-col gap-3">
            <span class="font-display text-xl">
              <span class="font-medium text-blue-300">Fx</span><span class="font-bold text-white">Garanti</span>
            </span>
            <p class="text-sm text-gray-400 leading-relaxed max-w-xs">
              FixPro cihazlarınız için garanti kayıt ve sorgulama platformu. Garantinizi kolayca yönetin.
            </p>
          </div>

          <!-- Links Column -->
          <div class="flex flex-col gap-3 sm:items-end">
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span class="inline-flex items-center gap-2 text-sm text-blue-300 font-medium">
                <span class="w-1 h-1 rounded-full bg-blue-400"></span>
                FxGaranti
              </span>
              <a href="https://servis.fixpro.com.tr" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors" @click="handleFooterLinkClick('https://servis.fixpro.com.tr', 'FxServis')">
                <span class="w-1 h-1 rounded-full bg-gray-600"></span>
                FxServis
                <svg class="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a href="https://fixpro.com.tr" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors" @click="handleFooterLinkClick('https://fixpro.com.tr', 'fixpro.com.tr')">
                <span class="w-1 h-1 rounded-full bg-gray-600"></span>
                fixpro.com.tr
                <svg class="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-white/[0.06] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="https://fixpro.com.tr" target="_blank" rel="noopener noreferrer" class="opacity-70 hover:opacity-100 transition-opacity" @click="handleFooterLinkClick('https://fixpro.com.tr', 'FixPro Logo')">
            <img src="/logo-white.png" alt="FixPro" class="h-7" width="148" height="40" />
          </a>
          <p class="text-xs text-gray-500">
            &copy; {{ new Date().getFullYear() }} FixPro. Tüm hakları saklıdır.
          </p>
        </div>
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
        <div v-if="showOtpModal && warrantyAuthInfo" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="OTP Doğrulama">
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
