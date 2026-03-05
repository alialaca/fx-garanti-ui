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
      <!-- Accent line -->
      <div class="h-0.5 bg-gradient-to-r from-primary via-accent to-primary-400"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Title -->
          <NuxtLink to="/kontrol" class="flex items-center gap-3 group">
            <span class="font-display text-xl">
              <span class="font-medium text-primary dark:text-primary-400">Fx</span><span class="font-bold text-primary dark:text-primary-400">Garanti</span>
            </span>
            <span class="hidden sm:inline-block h-5 w-px bg-gray-300 dark:bg-gray-700"></span>
            <span class="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <svg class="w-4 h-4 text-primary-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Kontrol Paneli
            </span>
          </NuxtLink>

          <!-- Right Actions -->
          <div class="flex items-center gap-3">
            <!-- Admin Name -->
            <div class="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center shadow-sm shadow-primary/20">
                <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ adminStore.displayName }}</span>
              <span v-if="adminStore.isAdmin" class="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">Admin</span>
              <span v-else class="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">Viewer</span>
            </div>

            <ThemeToggle />

            <!-- Logout -->
            <button
              @click="handleLogout"
              class="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200 hover:shadow-sm"
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
