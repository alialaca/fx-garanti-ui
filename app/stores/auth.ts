import { defineStore } from 'pinia'
import type { SessionResponse, IdentifierType, OtpPurpose } from '~/types'

interface AuthState {
  accessToken: string | null
  tokenType: string | null
  expiresAt: number | null
  identifier: string | null
  identifierType: IdentifierType | null
  purpose: OtpPurpose | null
  serialNumber: string | null // warranty_query için seri numarası
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    tokenType: null,
    expiresAt: null,
    identifier: null,
    identifierType: null,
    purpose: null,
    serialNumber: null
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
    // warranty_register için OTP context
    setOtpContext(identifier: string, identifierType: IdentifierType, purpose: OtpPurpose) {
      this.identifier = identifier
      this.identifierType = identifierType
      this.purpose = purpose
      this.serialNumber = null
    },

    // warranty_query için OTP context (serialNumber ile)
    setOtpContextForQuery(serialNumber: string, identifierType: IdentifierType, maskedIdentifier: string) {
      this.serialNumber = serialNumber
      this.identifierType = identifierType
      this.identifier = maskedIdentifier // Maskelenmiş bilgi (görüntüleme için)
      this.purpose = 'warranty_query'
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
      this.serialNumber = null
    }
  }
})
