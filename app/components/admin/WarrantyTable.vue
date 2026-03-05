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
          <tr class="border-b border-gray-200 dark:border-gray-800">
            <th class="admin-th">Seri No</th>
            <th class="admin-th">Cihaz Modeli</th>
            <th class="admin-th">Musteri</th>
            <th class="admin-th hidden sm:table-cell">Telefon</th>
            <th class="admin-th">Durum</th>
            <th class="admin-th hidden md:table-cell">Tarih</th>
            <th class="admin-th w-16"></th>
          </tr>
        </thead>

        <tbody v-if="loading">
          <tr v-for="i in 5" :key="i" class="border-b border-gray-100 dark:border-gray-800/50">
            <td v-for="j in 7" :key="j" class="admin-td" :class="{ 'hidden sm:table-cell': j === 4, 'hidden md:table-cell': j === 6 }">
              <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" :style="{ width: `${40 + Math.random() * 60}%` }"></div>
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="warranties.length === 0">
          <tr>
            <td colspan="7" class="py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Kayit bulunamadi</p>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="w in warranties"
            :key="w.id"
            @click="emit('select', w)"
            class="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
          >
            <td class="admin-td font-mono text-sm font-medium text-gray-900 dark:text-white">
              {{ w.serialNumber }}
            </td>
            <td class="admin-td text-gray-600 dark:text-gray-400">
              {{ w.deviceModel || '-' }}
            </td>
            <td class="admin-td text-gray-900 dark:text-white">
              {{ w.firstName }} {{ w.lastName }}
            </td>
            <td class="admin-td hidden sm:table-cell text-gray-500 dark:text-gray-400 font-mono text-sm">
              {{ maskPhone(w.phone) }}
            </td>
            <td class="admin-td">
              <span :class="statusClass[w.status]">{{ statusLabel[w.status] }}</span>
            </td>
            <td class="admin-td hidden md:table-cell text-gray-500 dark:text-gray-400 text-sm">
              {{ formatDate(w.createdAt) }}
            </td>
            <td class="admin-td">
              <button class="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
