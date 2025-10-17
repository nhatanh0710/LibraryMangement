<template>
  <div class="docgia-layout d-flex flex-column min-vh-100">
    <Header />

    <main class="container py-4">
      <router-view />
    </main>

    <footer class="text-center py-3 mt-auto bg-light">
      <div class="container">
        <small class="text-muted">© 2025 Thư viện - Bản quyền thuộc về bạn</small>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
</script>

<style scoped>
.container { max-width: 1100px; }
</style>
