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
      return this.admin?.role?.toLowerCase() === 'admin'
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
        localStorage.setItem('admin_token_ts', String(Date.now()))
      }
    },

    logout() {
      this.accessToken = null
      this.admin = null

      if (import.meta.client) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        localStorage.removeItem('admin_token_ts')
      }
    },

    hydrateFromStorage() {
      if (!import.meta.client) return

      const token = localStorage.getItem('admin_token')
      const userJson = localStorage.getItem('admin_user')
      const tokenTs = localStorage.getItem('admin_token_ts')

      if (token && userJson) {
        // Expire tokens after 24 hours
        const MAX_AGE_MS = 24 * 60 * 60 * 1000
        if (tokenTs && Date.now() - Number(tokenTs) > MAX_AGE_MS) {
          this.logout()
          return
        }

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
