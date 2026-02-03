<script setup lang="ts">
const route = useRoute()

const navItems = [
  { label: 'Anasayfa', to: '/' },
  { label: 'Garanti Kaydet', to: '/kayit' }
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50">
    <div class="glass border-b border-gray-200/30 dark:border-gray-700/30">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="hidden sm:block">
              <span class="font-display text-xl text-primary dark:text-primary-400">Fx</span>
              <span class="font-display text-xl text-gray-900 dark:text-white">Garanti</span>
            </div>
          </NuxtLink>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              :class="isActive(item.to)
                ? 'text-primary dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <ThemeToggle />

            <!-- Mobile Menu Button -->
            <button class="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
