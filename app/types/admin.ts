import type { WarrantyStatus } from '~/types'

export type AdminRole = 'ADMIN' | 'VIEWER'

export interface AdminUser {
  id: string
  username: string
  fullName: string
  role: AdminRole
}

export interface AdminLoginDto {
  username: string
  password: string
}

export interface AdminLoginResponse {
  accessToken: string
  admin: AdminUser
}

export interface PaginationMeta {
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface AdminWarranty {
  id: string
  serialNumber: string
  deviceModel: string | null
  firstName: string
  lastName: string
  identityNumber: string | null
  email: string
  phone: string
  status: WarrantyStatus
  warrantyStartDate: string | null
  warrantyEndDate: string | null
  warrantyDurationMonths: number | null
  invoiceDate: string | null
  invoiceNumber: string | null
  invoiceImageUrl: string | null
  voidReason: string | null
  sourceReference: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedWarrantyResponse {
  data: AdminWarranty[]
  meta: PaginationMeta
}

export interface ApproveWarrantyDto {
  warrantyStartDate: string
  invoiceDate?: string
  invoiceNumber?: string
}

export interface RejectWarrantyDto {
  reason: string
}

export interface InvoiceImageResponse {
  url: string
}
