<script setup lang="ts">
import type { AdminWarranty, PaginationMeta } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { getWarranties, searchWarranties } = useAdminApi()
const adminStore = useAdminStore()

const warranties = ref<AdminWarranty[]>([])
const meta = ref<PaginationMeta>({ total: 0, page: 1, per_page: 20, total_pages: 0 })
const loading = ref(true)
const statusFilter = ref('')
const searchQuery = ref('')
const perPage = ref(20)
const selectedWarranty = ref<AdminWarranty | null>(null)
const showDrawer = ref(false)

const statusTabs = computed(() => [
  { key: '', label: 'Tumu', count: undefined },
  { key: 'pending', label: 'Bekleyen' },
  { key: 'active', label: 'Aktif' },
  { key: 'expired', label: 'Suresi Dolmus' },
  { key: 'voided', label: 'Iptal' }
])

const fetchWarranties = async (page = 1) => {
  loading.value = true
  try {
    let result
    if (searchQuery.value.trim()) {
      const params: Record<string, any> = { page, per_page: perPage.value }
      if (searchQuery.value.includes('@')) {
        params.email = searchQuery.value.trim()
      } else {
        params.phone = searchQuery.value.trim()
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
  } catch {
    warranties.value = []
    meta.value = { total: 0, page: 1, per_page: perPage.value, total_pages: 0 }
  } finally {
    loading.value = false
  }
}

watch(statusFilter, () => {
  searchQuery.value = ''
  fetchWarranties(1)
})

watch(perPage, () => fetchWarranties(1))

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  if (!val.trim()) {
    fetchWarranties(1)
    return
  }
  searchTimeout = setTimeout(() => fetchWarranties(1), 400)
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
      <div class="flex items-center gap-3">
        <h1 class="text-xl sm:text-2xl font-display text-gray-900 dark:text-white">Garanti Yonetimi</h1>
        <span v-if="meta.total" class="badge bg-primary-100/80 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm">
          {{ meta.total }} kayit
        </span>
      </div>

      <!-- Search -->
      <div class="relative w-full sm:w-72">
        <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Telefon veya e-posta ara..."
          class="input pl-10 py-2.5 text-sm"
        />
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
