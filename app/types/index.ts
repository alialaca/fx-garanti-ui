export type IdentifierType = 'phone' | 'email'
export type OtpPurpose = 'warranty_register' | 'warranty_query'
export type WarrantyStatus = 'active' | 'expired' | 'voided' | 'out_of_warranty'

export interface RequestOtpDto {
  identifier: string
  identifierType: IdentifierType
  purpose: OtpPurpose
}

export interface OtpResponse {
  message: string
  expiresInMinutes: number
}

export interface VerifyOtpDto {
  identifier: string
  identifierType: IdentifierType
  otpCode: string
  purpose: OtpPurpose
}

export interface SessionResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export interface CreateWarrantyDto {
  serialNumber: string
  deviceModel?: string
  firstName: string
  lastName: string
  identityNumber?: string
  email: string
  phone: string
  invoiceImageUrl?: string
  invoiceDate?: string
  invoiceNumber?: string
  warrantyStartDate: string
  warrantyDurationMonths?: number
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
