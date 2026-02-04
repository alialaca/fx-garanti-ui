export type IdentifierType = 'phone' | 'email'
export type OtpPurpose = 'warranty_register' | 'warranty_query'
export type WarrantyStatus = 'active' | 'expired' | 'voided' | 'out_of_warranty'

// Cihazın kayıtlı iletişim bilgileri (maskelenmiş)
export interface WarrantyAuthInfo {
  serialNumber: string
  maskedPhone: string | null
  maskedEmail: string | null
  hasPhone: boolean
  hasEmail: boolean
}

// warranty_register için OTP talebi
export interface RequestOtpForRegisterDto {
  identifier: string
  identifierType: IdentifierType
  purpose: 'warranty_register'
}

// warranty_query için OTP talebi (serialNumber ile)
export interface RequestOtpForQueryDto {
  serialNumber: string
  identifierType: IdentifierType
  purpose: 'warranty_query'
}

export type RequestOtpDto = RequestOtpForRegisterDto | RequestOtpForQueryDto

export interface OtpResponse {
  message: string
  expiresInMinutes: number
  maskedIdentifier?: string // warranty_query için döner
}

// warranty_register için OTP doğrulama
export interface VerifyOtpForRegisterDto {
  identifier: string
  identifierType: IdentifierType
  otpCode: string
  purpose: 'warranty_register'
}

// warranty_query için OTP doğrulama (serialNumber ile)
export interface VerifyOtpForQueryDto {
  serialNumber: string
  otpCode: string
  purpose: 'warranty_query'
}

export type VerifyOtpDto = VerifyOtpForRegisterDto | VerifyOtpForQueryDto

export interface SessionResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

// Public API - multipart/form-data olarak gönderilir
export interface CreateWarrantyDto {
  serialNumber: string
  deviceModel?: string
  firstName: string
  lastName: string
  identityNumber?: string
  email: string
  phone: string
  sourceReference?: string
  // invoiceImage: File - form-data ile gönderilir (ZORUNLU)
  // NOT: warrantyStartDate ve warrantyDurationMonths API tarafından otomatik ayarlanır
}

export interface WarrantyResponse {
  id: string
  serialNumber: string
  deviceModel: string | null
  firstName: string
  lastName: string
  identityNumber: string | null
  email: string
  phone: string
  status: WarrantyStatus
  warrantyStartDate: string
  warrantyEndDate: string
  warrantyDurationMonths: number
  createdAt: string
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}
