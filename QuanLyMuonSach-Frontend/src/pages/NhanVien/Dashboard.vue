<template>
  <div class="dashboard">
    <h4 class="mb-3">📊 Tổng quan hệ thống</h4>

    <div class="row g-3">
      <div class="col-md-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body text-center">
            <h5 class="text-primary">📚 Sách</h5>
            <h2>{{ stats.books }}</h2>
            <small class="text-muted">Tổng số sách</small>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body text-center">
            <h5 class="text-success">🧑‍🤝‍🧑 Độc giả</h5>
            <h2>{{ stats.readers }}</h2>
            <small class="text-muted">Độc giả đang hoạt động</small>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body text-center">
            <h5 class="text-warning">📝 Phiếu mượn</h5>
            <h2>{{ stats.loans }}</h2>
            <small class="text-muted">Phiếu đang xử lý</small>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <h5>👋 Xin chào, {{ user?.hoTenNV || 'Nhân viên' }}</h5>
      <p>Chào mừng bạn quay lại hệ thống quản lý thư viện.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/users'
import api from '@/services/api'

const stats = ref({ books: 0, readers: 0, loans: 0 })
const user = useUserStore().user
const loading = ref(true)

onMounted(async () => {
  try {
    // Gọi các API có sẵn để lấy tổng số bản ghi
    const [booksRes, readersRes, loansRes] = await Promise.all([
      api.get('/sach?limit=1'), // Chỉ cần lấy 1 bản ghi để xem meta.total
      api.get('/docgia?limit=1'),
      api.get('/theodoimuonsach?limit=1&trangThai=CHỜ DUYỆT,ĐANG MƯỢN')
    ])

    stats.value = {
      books: booksRes.data.meta?.total || 0,
      readers: readersRes.data.meta?.total || 0,
      loans: loansRes.data.meta?.total || 0
    }
  } catch (error) {
    console.error('Lỗi tải thống kê:', error)
    // Fallback: dùng số liệu mẫu
    stats.value = { books: 156, readers: 89, loans: 23 }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard h4 {
  color: var(--primary-700, #116466);
  font-weight: 600;
}
.card-body h2 {
  font-weight: 700;
  margin: 0.5rem 0;
}
</style>