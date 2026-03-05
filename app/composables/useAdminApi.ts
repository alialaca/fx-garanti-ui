import axios, { type AxiosError } from 'axios'
import type {
  AdminLoginDto,
  AdminLoginResponse,
  PaginatedWarrantyResponse,
  AdminWarranty,
  ApproveWarrantyDto,
  RejectWarrantyDto,
  InvoiceImageResponse
} from '~/types/admin'
import type { ApiError } from '~/types'

export const useAdminApi = () => {
  const adminStore = useAdminStore()

  const authClient = axios.create({
    baseURL: '/api/v1/admin',
    headers: { 'Content-Type': 'application/json' }
  })

  const internalClient = axios.create({
    baseURL: '/api/v1/internal',
    headers: { 'Content-Type': 'application/json' }
  })

  internalClient.interceptors.request.use((config) => {
    if (adminStore.accessToken) {
      config.headers.Authorization = `Bearer ${adminStore.accessToken}`
    }
    return config
  })

  internalClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      if (error.response?.status === 401) {
        adminStore.logout()
        if (import.meta.client) {
          navigateTo('/kontrol/giris')
        }
      }
      return Promise.reject(error)
    }
  )

  const login = async (data: AdminLoginDto): Promise<AdminLoginResponse> => {
    const response = await authClient.post<AdminLoginResponse>('/auth/login', data)
    adminStore.setSession(response.data.accessToken, response.data.admin)
    return response.data
  }

  const getWarranties = async (params: {
    status?: string
    page?: number
    per_page?: number
    sort?: string
  } = {}): Promise<PaginatedWarrantyResponse> => {
    const response = await internalClient.get<PaginatedWarrantyResponse>('/warranties', { params })
    return response.data
  }

  const searchWarranties = async (params: {
    phone?: string
    email?: string
    page?: number
    per_page?: number
  }): Promise<PaginatedWarrantyResponse> => {
    const response = await internalClient.get<PaginatedWarrantyResponse>('/warranties/search', { params })
    return response.data
  }

  const getWarranty = async (serialNumber: string): Promise<AdminWarranty> => {
    const response = await internalClient.get<AdminWarranty>(`/warranties/${serialNumber}`)
    return response.data
  }

  const getInvoiceImage = async (serialNumber: string): Promise<InvoiceImageResponse> => {
    const response = await internalClient.get<InvoiceImageResponse>(`/warranties/${serialNumber}/invoice-image`)
    return response.data
  }

  const approveWarranty = async (serialNumber: string, data: ApproveWarrantyDto): Promise<AdminWarranty> => {
    const response = await internalClient.post<AdminWarranty>(`/warranties/${serialNumber}/approve`, data)
    return response.data
  }

  const rejectWarranty = async (serialNumber: string, data: RejectWarrantyDto): Promise<AdminWarranty> => {
    const response = await internalClient.post<AdminWarranty>(`/warranties/${serialNumber}/reject`, data)
    return response.data
  }

  return {
    login,
    getWarranties,
    searchWarranties,
    getWarranty,
    getInvoiceImage,
    approveWarranty,
    rejectWarranty
  }
}
