import { defineStore } from 'pinia'
import type { AdminUser } from '~/types/admin'

interface AdminState {
  accessToken: string | null
  admin: AdminUser | null
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    accessToken: null,
    admin: null
  }),

  getters: {
    isAuthenticated(): boolean {
      return !!this.accessToken
    },

    isAdmin(): boolean {
      return this.admin?.role === 'ADMIN'
    },

    displayName(): string {
      return this.admin?.fullName || this.admin?.username || ''
    }
  },

  actions: {
    setSession(accessToken: string, admin: AdminUser) {
      this.accessToken = accessToken
      this.admin = admin

      if (import.meta.client) {
        localStorage.setItem('admin_token', accessToken)
        localStorage.setItem('admin_user', JSON.stringify(admin))
      }
    },

    logout() {
      this.accessToken = null
      this.admin = null

      if (import.meta.client) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    },

    hydrateFromStorage() {
      if (!import.meta.client) return

      const token = localStorage.getItem('admin_token')
      const userJson = localStorage.getItem('admin_user')

      if (token && userJson) {
        try {
          this.accessToken = token
          this.admin = JSON.parse(userJson)
        } catch {
          this.logout()
        }
      }
    }
  }
})
