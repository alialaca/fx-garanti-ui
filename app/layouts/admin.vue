<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 gradient-mesh pattern-grid">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg">
      İçeriğe Geç
    </a>
    <AdminHeader />
    <main id="main-content" class="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>
