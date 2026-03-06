export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path') || ''
  const queryString = getRequestURL(event).search
  const target = `${config.warrantyServiceUrl}/api/v1/internal/${path}${queryString}`

  return proxyRequest(event, target)
})
