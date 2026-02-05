import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import type { WarrantyResponse, CreateWarrantyDto } from '~/types'

interface WarrantyState {
  currentWarranty: WarrantyResponse | null
  loading: boolean
  error: string | null
}

export const useWarrantyStore = defineStore('warranty', {
  state: (): WarrantyState => ({
    currentWarranty: null,
    loading: false,
    error: null
  }),

  getters: {
    isActive(): boolean {
      return this.currentWarranty?.status === 'active'
    },

    statusLabel(): string {
      if (!this.currentWarranty) return ''

      const labels: Record<string, string> = {
        active: 'Aktif',
        expired: 'Süresi Dolmuş',
        voided: 'İptal Edilmiş',
        out_of_warranty: 'Garanti Dışı'
      }
      return labels[this.currentWarranty.status] || this.currentWarranty.status
    },

    daysRemaining(): number | null {
      if (!this.currentWarranty || this.currentWarranty.status !== 'active') return null

      const endDate = new Date(this.currentWarranty.warrantyEndDate)
      const today = new Date()
      const diffTime = endDate.getTime() - today.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },

    remainingFormatted(): string | null {
      if (!this.currentWarranty) return null

      const endDate = dayjs(this.currentWarranty.warrantyEndDate)
      const today = dayjs()

      if (endDate.isBefore(today)) return null

      const years = endDate.diff(today, 'year')
      const months = endDate.diff(today.add(years, 'year'), 'month')
      const days = endDate.diff(today.add(years, 'year').add(months, 'month'), 'day')

      const parts: string[] = []
      if (years > 0) parts.push(`${years} yıl`)
      if (months > 0) parts.push(`${months} ay`)
      if (days > 0 || parts.length === 0) parts.push(`${days} gün`)

      return parts.join(' ')
    }
  },

  actions: {
    async fetchWarranty(serialNumber: string) {
      this.loading = true
      this.error = null

      try {
        const { getWarranty } = useApi()
        this.currentWarranty = await getWarranty(serialNumber)
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Garanti bilgisi alınamadı'
        this.currentWarranty = null
        throw err
      } finally {
        this.loading = false
      }
    },

    async createWarranty(data: CreateWarrantyDto, invoiceImage: File) {
      this.loading = true
      this.error = null

      try {
        const { createWarranty } = useApi()
        this.currentWarranty = await createWarranty(data, invoiceImage)
        return this.currentWarranty
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Garanti kaydı oluşturulamadı'
        throw err
      } finally {
        this.loading = false
      }
    },

    clearWarranty() {
      this.currentWarranty = null
      this.error = null
    }
  }
})
