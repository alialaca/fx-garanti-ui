<script setup lang="ts">
import type { AdminWarranty, PaginationMeta } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useHead({ title: 'Garanti Yönetimi | FxGaranti' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { getWarranties, searchWarranties } = useAdminApi()
const adminStore = useAdminStore()
const { trackEvent } = useTracking()

const warranties = ref<AdminWarranty[]>([])
const meta = ref<PaginationMeta>({ total: 0, page: 1, per_page: 20, total_pages: 0 })
const loading = ref(true)
const statusFilter = ref('pending')
const searchType = ref<'serial' | 'phone' | 'identity'>('serial')
const searchQuery = ref('')
const perPage = ref(20)
const selectedWarranty = ref<AdminWarranty | null>(null)
const showDrawer = ref(false)

const searchTypes = [
  { key: 'serial' as const, label: 'Seri No' },
  { key: 'phone' as const, label: 'Telefon' },
  { key: 'identity' as const, label: 'TC Kimlik' }
]

const searchPlaceholder = computed(() => {
  switch (searchType.value) {
    case 'serial': return 'Seri numarasi ile ara...'
    case 'phone': return 'Telefon numarasi ile ara...'
    case 'identity': return 'TC Kimlik numarasi ile ara...'
  }
})

const headerSubtitle = computed(() => {
  switch (statusFilter.value) {
    case 'pending': return 'Onay bekleyen garanti kayitlari'
    case 'active': return 'Aktif garanti kayitlari'
    case 'expired': return 'Suresi dolmus garanti kayitlari'
    case 'voided': return 'Iptal edilen garanti kayitlari'
    default: return 'Tum garanti kayitlari'
  }
})

const pendingCount = ref<number | undefined>(undefined)

const statusTabs = computed(() => [
  { key: '', label: 'Tumu', count: undefined },
  { key: 'pending', label: 'Bekleyen', count: pendingCount.value },
  { key: 'active', label: 'Aktif' },
  { key: 'expired', label: 'Suresi Dolmus' },
  { key: 'voided', label: 'Iptal' }
])

const fetchWarranties = async (page = 1) => {
  loading.value = true
  try {
    let result
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim()
      const params: Record<string, any> = { page, per_page: perPage.value, sort: '-createdAt' }

      switch (searchType.value) {
        case 'serial':
          params.serial_numbers = [q]
          break
        case 'phone':
          params.phone = q
          break
        case 'identity':
          params.identity_number = q
          break
      }

      if (statusFilter.value) {
        params.status = statusFilter.value
      }

      result = await searchWarranties(params)
    } else {
      result = await getWarranties({
        status: statusFilter.value || undefined,
        page,
        per_page: perPage.value,
        sort: '-createdAt'
      })
    }
    warranties.value = result.data
    meta.value = result.meta
    if (statusFilter.value === 'pending' && !searchQuery.value.trim()) {
      pendingCount.value = result.meta.total
    }
  } catch {
    warranties.value = []
    meta.value = { total: 0, page: 1, per_page: perPage.value, total_pages: 0 }
  } finally {
    loading.value = false
  }
}

watch(statusFilter, (val) => {
  if (val) trackEvent('admin-filter', { status: val })
  searchQuery.value = ''
  fetchWarranties(1)
})

watch(searchType, () => {
  if (searchQuery.value.trim()) {
    fetchWarranties(1)
  }
})

watch(perPage, () => fetchWarranties(1))

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  if (!val.trim()) {
    fetchWarranties(1)
    return
  }
  searchTimeout = setTimeout(() => {
    trackEvent('admin-search', { type: searchType.value })
    fetchWarranties(1)
  }, 400)
})

const handlePageChange = (page: number) => fetchWarranties(page)

const handleSelectWarranty = (warranty: AdminWarranty) => {
  selectedWarranty.value = warranty
  showDrawer.value = true
}

const handleDrawerClose = () => {
  showDrawer.value = false
  setTimeout(() => { selectedWarranty.value = null }, 300)
}

const handleWarrantyUpdated = (updated: AdminWarranty) => {
  const index = warranties.value.findIndex(w => w.id === updated.id)
  if (index !== -1) {
    warranties.value[index] = updated
  }
  selectedWarranty.value = updated
}

onMounted(() => fetchWarranties())
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-xl sm:text-2xl font-display text-gray-900 dark:text-white">Garanti Yonetimi</h1>
          <span v-if="meta.total" class="badge bg-primary-100/80 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm">
            {{ meta.total }} kayit
          </span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
          <span v-if="statusFilter === 'pending'" class="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {{ headerSubtitle }}
        </p>
      </div>

      <!-- Search -->
      <div class="flex w-full sm:w-auto gap-2">
        <div class="flex rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
          <button
            v-for="st in searchTypes"
            :key="st.key"
            @click="searchType = st.key; searchQuery = ''"
            class="px-3 py-2 text-xs font-medium transition-all duration-200"
            :class="searchType === st.key
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'"
          >
            {{ st.label }}
          </button>
        </div>
        <div class="relative flex-1 sm:w-56">
          <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="input pl-10 py-2.5 text-sm w-full"
          />
        </div>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="animate-fade-in-up animate-delay-100">
      <AdminStatusFilter v-model="statusFilter" :tabs="statusTabs" />
    </div>

    <!-- Table -->
    <div class="animate-fade-in-up animate-delay-200">
      <AdminWarrantyTable
        :warranties="warranties"
        :loading="loading"
        @select="handleSelectWarranty"
      />
    </div>

    <!-- Pagination -->
    <div v-if="meta.total_pages > 1" class="animate-fade-in-up animate-delay-300">
      <AdminPagination
        :meta="meta"
        :per-page="perPage"
        @update:page="handlePageChange"
        @update:per-page="perPage = $event"
      />
    </div>

    <!-- Detail Drawer -->
    <AdminWarrantyDetailDrawer
      :warranty="selectedWarranty"
      :open="showDrawer"
      @close="handleDrawerClose"
      @updated="handleWarrantyUpdated"
    />
  </div>
</template>
