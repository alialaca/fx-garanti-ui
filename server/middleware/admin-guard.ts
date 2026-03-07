export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  // Only protect admin API routes - page protection is handled client-side
  if (!url.pathname.startsWith('/api/v1/admin/')) return

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
