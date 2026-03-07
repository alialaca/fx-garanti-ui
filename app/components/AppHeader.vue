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

const isMobileMenuOpen = ref(false)

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50">
    <div class="glass border-b border-gray-200/30 dark:border-gray-700/30">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center group">
            <span class="font-display text-xl">
              <span class="font-medium text-primary dark:text-primary-400">Fx</span><span class="font-bold text-primary dark:text-primary-400">Garanti</span>
            </span>
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
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              :aria-expanded="isMobileMenuOpen"
              aria-label="Menü"
              class="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            >
              <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden border-b border-gray-200/30 dark:border-gray-700/30 glass">
        <nav class="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
            :class="isActive(item.to)
              ? 'text-primary dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>
