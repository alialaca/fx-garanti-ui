<script setup lang="ts">
import type { AdminWarranty } from '~/types/admin'
import type { WarrantyStatus } from '~/types'
import dayjs from 'dayjs'
import 'dayjs/locale/tr'

defineProps<{
  warranties: AdminWarranty[]
  loading: boolean
}>()

const emit = defineEmits<{
  select: [warranty: AdminWarranty]
}>()

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
  return dayjs(date).locale('tr').format('DD.MM.YYYY')
}

const maskPhone = (phone: string) => {
  if (phone.length <= 4) return phone
  return phone.slice(0, 4) + '***' + phone.slice(-2)
}
</script>

<template>
  <div class="card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200/80 dark:border-gray-800/80">
            <th class="admin-th first:rounded-tl-2xl">Seri No</th>
            <th class="admin-th hidden sm:table-cell">Cihaz Modeli</th>
            <th class="admin-th">Musteri</th>
            <th class="admin-th hidden sm:table-cell">Telefon</th>
            <th class="admin-th">Durum</th>
            <th class="admin-th hidden md:table-cell">Tarih</th>
            <th class="admin-th w-16 last:rounded-tr-2xl"></th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="i in 5" :key="i" class="border-b border-gray-100 dark:border-gray-800/50">
            <td v-for="j in 7" :key="j" class="admin-td" :class="{ 'hidden sm:table-cell': j === 2 || j === 4, 'hidden md:table-cell': j === 6 }">
              <div
                class="h-4 rounded-lg animate-pulse"
                :class="j === 5 ? 'bg-primary-100/60 dark:bg-primary-900/20 w-20' : 'bg-gray-100 dark:bg-gray-800/60'"
                :style="j !== 5 ? { width: `${40 + Math.random() * 60}%` } : undefined"
              ></div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="warranties.length === 0">
          <tr>
            <td colspan="7" class="py-20 text-center">
              <div class="flex flex-col items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Kayit bulunamadi</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Farkli bir filtre deneyin</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="(w, index) in warranties"
            :key="w.id"
            @click="emit('select', w)"
            class="group border-b border-gray-100/80 dark:border-gray-800/40 hover:bg-primary-50/40 dark:hover:bg-primary-950/20 cursor-pointer transition-all duration-200"
            :style="{ animationDelay: `${index * 30}ms` }"
          >
            <td class="admin-td font-mono text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              {{ w.serialNumber }}
            </td>
            <td class="admin-td hidden sm:table-cell text-gray-600 dark:text-gray-400">
              {{ w.deviceModel || '-' }}
            </td>
            <td class="admin-td text-gray-900 dark:text-white font-medium">
              {{ w.firstName }} {{ w.lastName }}
            </td>
            <td class="admin-td hidden sm:table-cell text-gray-500 dark:text-gray-400 font-mono text-xs sm:text-sm">
              {{ maskPhone(w.phone) }}
            </td>
            <td class="admin-td">
              <span :class="statusClass[w.status]">{{ statusLabel[w.status] }}</span>
            </td>
            <td class="admin-td hidden md:table-cell text-gray-500 dark:text-gray-400 text-sm">
              {{ formatDate(w.createdAt) }}
            </td>
            <td class="admin-td">
              <button class="p-2 rounded-xl text-gray-300 group-hover:text-primary-600 dark:text-gray-600 dark:group-hover:text-primary-400 transition-all duration-200 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
