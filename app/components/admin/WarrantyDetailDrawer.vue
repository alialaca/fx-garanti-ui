<script setup lang="ts">
import type { AdminWarranty } from '~/types/admin'
import type { WarrantyStatus } from '~/types'
import dayjs from 'dayjs'
import 'dayjs/locale/tr'

const props = defineProps<{
  warranty: AdminWarranty | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  updated: [warranty: AdminWarranty]
}>()

const adminStore = useAdminStore()

const showApproveModal = ref(false)
const showRejectModal = ref(false)

const statusLabel: Record<WarrantyStatus, string> = {
  pending: 'Bekleyen',
  active: 'Aktif',
  expired: 'Suresi Dolmus',
  voided: 'Iptal',
  out_of_warranty: 'Garanti Disi'
}

const statusClass: Record<WarrantyStatus, string> = {
  pending: 'badge-pending',
  active: 'badge-active',
  expired: 'badge-expired',
  voided: 'badge-voided',
  out_of_warranty: 'badge-out-of-warranty'
}

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return dayjs(date).locale('tr').format('DD MMMM YYYY')
}

const handleApproved = (updated: AdminWarranty) => {
  showApproveModal.value = false
  emit('updated', updated)
}

const handleRejected = (updated: AdminWarranty) => {
  showRejectModal.value = false
  emit('updated', updated)
}

const isPending = computed(() => props.warranty?.status === 'pending')
const canTakeAction = computed(() => adminStore.isAdmin && isPending.value)
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm" @click="emit('close')"></div>
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="open && warranty"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-gray-950 shadow-2xl overflow-y-auto"
      >
        <!-- Header -->
        <div class="sticky top-0 z-10 glass border-b border-gray-200/30 dark:border-gray-700/30 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span :class="statusClass[warranty.status]">{{ statusLabel[warranty.status] }}</span>
            <span class="font-mono text-sm font-medium text-gray-900 dark:text-white">{{ warranty.serialNumber }}</span>
          </div>
          <button
            @click="emit('close')"
            class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Customer Info -->
          <section>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Musteri Bilgileri</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Ad Soyad</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ warranty.firstName }} {{ warranty.lastName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Telefon</span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">{{ warranty.phone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">E-posta</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ warranty.email }}</span>
              </div>
              <div v-if="warranty.identityNumber" class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">TC Kimlik No</span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">{{ warranty.identityNumber }}</span>
              </div>
            </div>
          </section>

          <hr class="border-gray-200 dark:border-gray-800" />

          <!-- Device Info -->
          <section>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Cihaz Bilgileri</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Seri Numarasi</span>
                <span class="text-sm font-mono font-medium text-gray-900 dark:text-white">{{ warranty.serialNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Cihaz Modeli</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ warranty.deviceModel || '-' }}</span>
              </div>
              <div v-if="warranty.sourceReference" class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Kaynak Referans</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ warranty.sourceReference }}</span>
              </div>
            </div>
          </section>

          <hr class="border-gray-200 dark:border-gray-800" />

          <!-- Warranty Dates -->
          <section>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Garanti Bilgileri</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Baslangic Tarihi</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ formatDate(warranty.warrantyStartDate) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Bitis Tarihi</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ formatDate(warranty.warrantyEndDate) }}</span>
              </div>
              <div v-if="warranty.warrantyDurationMonths" class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Sure</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ warranty.warrantyDurationMonths }} ay</span>
              </div>
              <div v-if="warranty.invoiceDate" class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Fatura Tarihi</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ formatDate(warranty.invoiceDate) }}</span>
              </div>
              <div v-if="warranty.invoiceNumber" class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Fatura No</span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">{{ warranty.invoiceNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Olusturma Tarihi</span>
                <span class="text-sm text-gray-900 dark:text-white">{{ formatDate(warranty.createdAt) }}</span>
              </div>
            </div>
          </section>

          <!-- Void Reason -->
          <template v-if="warranty.voidReason">
            <hr class="border-gray-200 dark:border-gray-800" />
            <section>
              <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Red Sebebi</h4>
              <p class="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                {{ warranty.voidReason }}
              </p>
            </section>
          </template>

          <hr class="border-gray-200 dark:border-gray-800" />

          <!-- Invoice Image -->
          <section>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Fatura Gorseli</h4>
            <AdminInvoiceViewer :serial-number="warranty.serialNumber" />
          </section>

          <!-- Actions -->
          <template v-if="canTakeAction">
            <hr class="border-gray-200 dark:border-gray-800" />
            <section class="flex gap-3">
              <button
                @click="showApproveModal = true"
                class="btn flex-1 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 focus:ring-emerald-500"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Onayla
              </button>
              <button
                @click="showRejectModal = true"
                class="btn flex-1 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/25 focus:ring-red-500"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reddet
              </button>
            </section>
          </template>
        </div>

        <!-- Modals -->
        <AdminApproveModal
          v-if="warranty"
          :warranty="warranty"
          :open="showApproveModal"
          @close="showApproveModal = false"
          @approved="handleApproved"
        />

        <AdminRejectModal
          v-if="warranty"
          :warranty="warranty"
          :open="showRejectModal"
          @close="showRejectModal = false"
          @rejected="handleRejected"
        />
      </div>
    </Transition>
  </Teleport>
</template>
