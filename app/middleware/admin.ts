export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const adminStore = useAdminStore()
  adminStore.hydrateFromStorage()

  if (!adminStore.isAuthenticated) {
    return navigateTo('/kontrol/giris')
  }
})
