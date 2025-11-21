<!-- src/components/AccountPanel.vue -->
<template>
  <div class="card mb-3">
    <div class="card-body">
      <h5 class="card-title">Tài khoản</h5>
      <div v-if="user">
        <div><strong>Họ và tên:</strong> {{ user.hoLot }} {{ user.ten }}</div>
        <div><strong>Mã:</strong> {{ user.maDocGia }}</div>
        <div><strong>Địa chỉ:</strong> {{ user.diaChi || '—' }}</div>
        <div><strong>SĐT:</strong> {{ user.dienThoai || '—' }}</div>
        <div class="mt-2">
          <router-link to="/user/profile" class="btn btn-outline-primary btn-sm">Xem / Sửa thông tin</router-link>
          <router-link to="/user/history" class="btn btn-outline-secondary btn-sm ms-2">Lịch sử mượn</router-link>
        </div>
      </div>
      <div v-else class="text-muted">Bạn chưa đăng nhập.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const user = ref(null)

// Giả sử thông tin user được lưu trong localStorage sau khi đăng nhập
onMounted(() => {
  try {
    const raw = localStorage.getItem('user')
    if (raw) user.value = JSON.parse(raw)
  } catch {}
})
</script>
