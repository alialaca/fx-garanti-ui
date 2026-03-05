export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path') || ''
  const target = `${config.warrantyServiceUrl}/api/v1/internal/${path}`

  return proxyRequest(event, target)
})
