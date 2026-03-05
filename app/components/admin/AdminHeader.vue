<script setup lang="ts">
const adminStore = useAdminStore()
const router = useRouter()

const handleLogout = () => {
  adminStore.logout()
  router.push('/kontrol/giris')
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50">
    <div class="glass border-b border-gray-200/30 dark:border-gray-700/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Title -->
          <NuxtLink to="/kontrol" class="flex items-center gap-3">
            <span class="font-display text-xl">
              <span class="font-medium text-primary dark:text-primary-400">Fx</span><span class="font-bold text-primary dark:text-primary-400">Garanti</span>
            </span>
            <span class="hidden sm:inline-block h-5 w-px bg-gray-300 dark:bg-gray-700"></span>
            <span class="hidden sm:inline-block text-sm font-medium text-gray-500 dark:text-gray-400">Kontrol Paneli</span>
          </NuxtLink>

          <!-- Right Actions -->
          <div class="flex items-center gap-3">
            <!-- Admin Name -->
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg class="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ adminStore.displayName }}</span>
              <span v-if="adminStore.admin?.role === 'VIEWER'" class="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Viewer</span>
            </div>

            <ThemeToggle />

            <!-- Logout -->
            <button
              @click="handleLogout"
              class="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
              title="Cikis Yap"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
