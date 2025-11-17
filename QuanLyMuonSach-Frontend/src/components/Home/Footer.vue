<!-- src/components/Footer.vue -->
<template>
  <footer class="py-3 mt-auto" :style="styleFooter">
    <div class="container d-flex justify-content-between align-items-center">
      <div>
        <strong>Thư viện Khoa</strong>
        <div class="small">Địa chỉ: 123 Đường A, Thành phố B</div>
      </div>
      <div class="text-end small">
        © {{ year }} - Hệ thống Quản lý Mượn Sách
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
const year = new Date().getFullYear()
const styleFooter = {
  backgroundColor: '#2C3531',
  color: '#D1E8E2'
}
</script>

<style scoped>
footer { border-top: 4px solid rgba(255,255,255,0.03); }
</style>
