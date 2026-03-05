<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 gradient-mesh pattern-grid">
    <AdminHeader />
    <main class="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>
