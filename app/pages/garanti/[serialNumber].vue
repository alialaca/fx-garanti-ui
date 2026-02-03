<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const warrantyStore = useWarrantyStore()
const authStore = useAuthStore()

const serialNumber = computed(() => route.params.serialNumber as string)
const loading = ref(true)
const error = ref('')

const warranty = computed(() => warrantyStore.currentWarranty)
const statusLabel = computed(() => warrantyStore.statusLabel)
const daysRemaining = computed(() => warrantyStore.daysRemaining)

const statusConfig = computed(() => {
  if (!warranty.value) return { class: '', icon: '', color: '' }

  const configs: Record<string, { class: string; icon: string; color: string }> = {
    active: {
      class: 'badge-active',
      icon: 'check-circle',
      color: 'emerald'
    },
    expired: {
      class: 'badge-expired',
      icon: 'x-circle',
      color: 'red'
    },
    voided: {
      class: 'badge-voided',
      icon: 'ban',
      color: 'gray'
    },
    out_of_warranty: {
      class: 'badge-expired',
      icon: 'exclamation',
      color: 'red'
    }
  }

  return configs[warranty.value.status] || configs.expired
})

const maskEmail = (email: string) => {
  const [local, domain] = email.split('@')
  if (local.length <= 2) return `${local}***@${domain}`
  return `${local.slice(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`
}

const maskPhone = (phone: string) => {
  if (phone.length < 4) return '***'
  return `${phone.slice(0, 3)}****${phone.slice(-2)}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const progressPercentage = computed(() => {
  if (!warranty.value || warranty.value.status !== 'active') return 0

  const start = new Date(warranty.value.warrantyStartDate).getTime()
  const end = new Date(warranty.value.warrantyEndDate).getTime()
  const now = Date.now()

  const total = end - start
  const elapsed = now - start

  return Math.min(100, Math.max(0, (elapsed / total) * 100))
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/')
    return
  }

  try {
    await warrantyStore.fetchWarranty(serialNumber.value)
  } catch (err: any) {
    if (err.response?.status === 404) {
      error.value = 'Bu seri numarasına ait garanti kaydı bulunamadı.'
    } else if (err.response?.status === 401) {
      router.push('/')
    } else {
      error.value = 'Garanti bilgileri yüklenirken bir hata oluştu.'
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />

    <main class="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Back Button -->
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ana Sayfaya Dön
        </NuxtLink>

        <!-- Loading State -->
        <div v-if="loading" class="card p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400">Garanti bilgileri yükleniyor...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="card p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-xl font-display text-gray-900 dark:text-white mb-2">Bir Hata Oluştu</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">{{ error }}</p>
          <NuxtLink to="/" class="btn-primary">
            Ana Sayfaya Dön
          </NuxtLink>
        </div>

        <!-- Warranty Details -->
        <div v-else-if="warranty" class="space-y-6">
          <!-- Status Header Card -->
          <div class="card p-8 relative overflow-hidden">
            <!-- Background Accent -->
            <div
              class="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -z-10 opacity-20"
              :class="warranty.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'"
            ></div>

            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div class="flex items-start gap-4">
                <div
                  class="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  :class="warranty.status === 'active'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'"
                >
                  <!-- Check Circle -->
                  <svg v-if="statusConfig.icon === 'check-circle'" class="w-8 h-8" :class="warranty.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <!-- X Circle -->
                  <svg v-else-if="statusConfig.icon === 'x-circle'" class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <!-- Ban -->
                  <svg v-else class="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>

                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <h1 class="text-2xl font-display text-gray-900 dark:text-white">Garanti Durumu</h1>
                    <span :class="statusConfig.class">
                      <span v-if="warranty.status === 'active'" class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {{ statusLabel }}
                    </span>
                  </div>
                  <p class="text-gray-500 dark:text-gray-400">
                    Seri No: <span class="font-mono text-gray-900 dark:text-white">{{ warranty.serialNumber }}</span>
                  </p>
                </div>
              </div>

              <div v-if="warranty.status === 'active' && daysRemaining" class="text-right">
                <div class="text-4xl font-display text-gray-900 dark:text-white">{{ daysRemaining }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">gün kaldı</div>
              </div>
            </div>

            <!-- Progress Bar (only for active warranties) -->
            <div v-if="warranty.status === 'active'" class="mt-8">
              <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>{{ formatDate(warranty.warrantyStartDate) }}</span>
                <span>{{ formatDate(warranty.warrantyEndDate) }}</span>
              </div>
              <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  :style="{ width: `${progressPercentage}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Info Cards Grid -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Device Info -->
            <div class="card p-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 class="font-display text-lg text-gray-900 dark:text-white">Cihaz Bilgileri</h2>
              </div>

              <dl class="space-y-4">
                <div class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <dt class="text-gray-500 dark:text-gray-400">Model</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ warranty.deviceModel || '-' }}</dd>
                </div>
                <div class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <dt class="text-gray-500 dark:text-gray-400">Seri Numarası</dt>
                  <dd class="font-mono text-sm text-gray-900 dark:text-white">{{ warranty.serialNumber }}</dd>
                </div>
                <div class="flex justify-between py-3">
                  <dt class="text-gray-500 dark:text-gray-400">Kayıt Tarihi</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ formatDate(warranty.createdAt) }}</dd>
                </div>
              </dl>
            </div>

            <!-- Customer Info -->
            <div class="card p-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 class="font-display text-lg text-gray-900 dark:text-white">Müşteri Bilgileri</h2>
              </div>

              <dl class="space-y-4">
                <div class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <dt class="text-gray-500 dark:text-gray-400">Ad Soyad</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ warranty.firstName }} {{ warranty.lastName }}</dd>
                </div>
                <div class="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <dt class="text-gray-500 dark:text-gray-400">E-posta</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ maskEmail(warranty.email) }}</dd>
                </div>
                <div class="flex justify-between py-3">
                  <dt class="text-gray-500 dark:text-gray-400">Telefon</dt>
                  <dd class="font-medium text-gray-900 dark:text-white">{{ maskPhone(warranty.phone) }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Warranty Period Card -->
          <div class="card p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="font-display text-lg text-gray-900 dark:text-white">Garanti Süresi</h2>
            </div>

            <div class="grid sm:grid-cols-3 gap-6">
              <div class="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Başlangıç</div>
                <div class="font-display text-lg text-gray-900 dark:text-white">{{ formatDate(warranty.warrantyStartDate) }}</div>
              </div>
              <div class="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Bitiş</div>
                <div class="font-display text-lg text-gray-900 dark:text-white">{{ formatDate(warranty.warrantyEndDate) }}</div>
              </div>
              <div class="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Süre</div>
                <div class="font-display text-lg text-gray-900 dark:text-white">{{ warranty.warrantyDurationMonths }} Ay</div>
              </div>
            </div>
          </div>

          <!-- Info Note -->
          <div class="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-sm text-primary-700 dark:text-primary-300">
                  Garanti kapsamında servis hizmeti almak için yetkili servis merkezlerimize başvurabilirsiniz. Servis başvurularınızda bu seri numarasını belirtmeniz yeterlidir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
