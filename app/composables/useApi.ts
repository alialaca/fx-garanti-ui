import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type {
  RequestOtpDto,
  OtpResponse,
  VerifyOtpDto,
  SessionResponse,
  CreateWarrantyDto,
  WarrantyResponse,
  ApiError
} from '~/types'

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const client: AxiosInstance = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  client.interceptors.request.use((config) => {
    const token = authStore.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      if (error.response?.status === 401) {
        authStore.clearSession()
      }
      return Promise.reject(error)
    }
  )

  const requestOtp = async (data: RequestOtpDto): Promise<OtpResponse> => {
    const response = await client.post<OtpResponse>('/otp', data)
    return response.data
  }

  const verifyOtp = async (data: VerifyOtpDto): Promise<SessionResponse> => {
    const response = await client.post<SessionResponse>('/sessions', data)
    authStore.setSession(response.data)
    return response.data
  }

  const createWarranty = async (data: CreateWarrantyDto, invoiceImage: File): Promise<WarrantyResponse> => {
    const formData = new FormData()

    // Add all DTO fields to FormData
    formData.append('serialNumber', data.serialNumber)
    formData.append('firstName', data.firstName)
    formData.append('lastName', data.lastName)
    formData.append('email', data.email)
    formData.append('phone', data.phone)

    if (data.deviceModel) {
      formData.append('deviceModel', data.deviceModel)
    }
    if (data.identityNumber) {
      formData.append('identityNumber', data.identityNumber)
    }
    if (data.sourceReference) {
      formData.append('sourceReference', data.sourceReference)
    }

    // Add invoice image (required)
    formData.append('invoiceImage', invoiceImage)

    const response = await client.post<WarrantyResponse>('/warranties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  const getWarranty = async (serialNumber: string): Promise<WarrantyResponse> => {
    const response = await client.get<WarrantyResponse>(`/warranties/${serialNumber}`)
    return response.data
  }

  return {
    client,
    requestOtp,
    verifyOtp,
    createWarranty,
    getWarranty
  }
}
