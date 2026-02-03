import { defineStore } from 'pinia'
import type { SessionResponse, IdentifierType, OtpPurpose } from '~/types'

interface AuthState {
  accessToken: string | null
  tokenType: string | null
  expiresAt: number | null
  identifier: string | null
  identifierType: IdentifierType | null
  purpose: OtpPurpose | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    tokenType: null,
    expiresAt: null,
    identifier: null,
    identifierType: null,
    purpose: null
  }),

  getters: {
    isAuthenticated(): boolean {
      if (!this.accessToken || !this.expiresAt) return false
      return Date.now() < this.expiresAt
    },

    token(): string | null {
      if (!this.isAuthenticated) return null
      return this.accessToken
    }
  },

  actions: {
    setOtpContext(identifier: string, identifierType: IdentifierType, purpose: OtpPurpose) {
      this.identifier = identifier
      this.identifierType = identifierType
      this.purpose = purpose
    },

    setSession(session: SessionResponse) {
      this.accessToken = session.accessToken
      this.tokenType = session.tokenType
      this.expiresAt = Date.now() + session.expiresIn * 1000
    },

    clearSession() {
      this.accessToken = null
      this.tokenType = null
      this.expiresAt = null
      this.identifier = null
      this.identifierType = null
      this.purpose = null
    }
  }
})
