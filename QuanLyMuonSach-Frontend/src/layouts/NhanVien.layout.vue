<template>
  <div class="nhanvien-layout d-flex flex-column min-vh-100">
    <Header />

    <div class="d-flex flex-grow-1">
      <Sidebar />

      <section class="content-area flex-fill p-4">
        <router-view />
      </section>
    </div>

    <footer class="text-center py-3 bg-light">
      <small class="text-muted">© 2025 Thư viện - Khu quản trị</small>
    </footer>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

<style scoped>
.content-area {
  background: #f6f7f9;
  min-height: calc(100vh - 56px);
}
</style>
