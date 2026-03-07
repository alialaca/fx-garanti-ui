export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path') || ''

  if (/[.]{2}/.test(path)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }

  const queryString = getRequestURL(event).search
  const target = `${config.warrantyServiceUrl}/api/v1/admin/${path}${queryString}`

  return proxyRequest(event, target)
})
