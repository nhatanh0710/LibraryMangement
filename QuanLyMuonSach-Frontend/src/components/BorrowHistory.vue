<template>
  <div class="mt-4">
    <h6 class="mb-3">📚 Lịch sử mượn sách</h6>
    
    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border spinner-border-sm" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <span class="ms-2">Đang tải lịch sử mượn sách...</span>
    </div>

    <div v-else-if="error" class="alert alert-warning py-2">
      {{ error }}
    </div>

    <div v-else-if="items.length === 0" class="text-muted text-center py-3">
      Chưa có lịch sử mượn sách
    </div>

    <div v-else class="table-responsive">
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr>
            <th>Mã sách</th>
            <th>Tên sách</th>
            <th>Ngày mượn</th>
            <th>Ngày trả dự kiến</th>
            <th>Ngày trả thực tế</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item._id">
            <td>{{ item.maSach?.maSach || '—' }}</td>
            <td>{{ item.maSach?.tenSach || '—' }}</td>
            <td>{{ formatDate(item.ngayMuon) }}</td>
            <td>{{ formatDate(item.ngayDuKienTra) }}</td>
            <td>{{ formatDate(item.ngayTra) || '—' }}</td>
            <td>
              <span :class="`badge ${getStatusClass(item.trangThai)}`">
                {{ item.trangThai }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phân trang (nếu cần) -->
    <div v-if="meta && meta.totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
      <small class="text-muted">
        Hiển thị {{ items.length }} / {{ meta.total }} phiếu mượn
      </small>
      <div class="btn-group btn-group-sm">
        <button 
          class="btn btn-outline-secondary" 
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
        >
          ← Trước
        </button>
        <button 
          class="btn btn-outline-secondary" 
          :disabled="currentPage >= meta.totalPages"
          @click="changePage(currentPage + 1)"
        >
          Sau →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api'

const props = defineProps({
  maDocGia: { type: String, required: true }
})

const items = ref([])
const loading = ref(false)
const error = ref('')
const meta = ref(null)
const currentPage = ref(1)

// Load dữ liệu
async function loadBorrowHistory() {
  loading.value = true
  error.value = ''
  
  try {
    console.log('🔍 Đang tìm phiếu mượn cho độc giả:', props.maDocGia)
    
    const response = await api.get('/theodoimuonsach', {
      params: {
        maDocGia: props.maDocGia,
        page: currentPage.value,
        limit: 10
      }
    })

    console.log('📊 Kết quả API:', response.data)
    
    if (response.data.success) {
      items.value = response.data.data || []
      meta.value = response.data.meta
      
      if (items.value.length === 0) {
        error.value = 'Không tìm thấy phiếu mượn nào'
      }
    } else {
      error.value = response.data.message || 'Có lỗi khi tải dữ liệu'
    }
  } catch (err) {
    console.error('❌ Lỗi tải lịch sử mượn sách:', err)
    error.value = err.response?.data?.message || 'Không thể tải lịch sử mượn sách'
  } finally {
    loading.value = false
  }
}

// Format ngày
function formatDate(dateString) {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString('vi-VN')
  } catch {
    return dateString
  }
}

// Class cho trạng thái
function getStatusClass(status) {
  const statusMap = {
    'CHỜ DUYỆT': 'bg-warning text-dark',
    'ĐÃ DUYỆT': 'bg-info text-white',
    'ĐANG MƯỢN': 'bg-primary text-white',
    'ĐÃ TRẢ': 'bg-success text-white',
    'QUÁ HẠN': 'bg-danger text-white'
  }
  return statusMap[status] || 'bg-secondary text-white'
}

// Chuyển trang
function changePage(page) {
  currentPage.value = page
  loadBorrowHistory()
}

// Theo dõi thay đổi maDocGia
watch(() => props.maDocGia, (newMaDocGia) => {
  if (newMaDocGia) {
    currentPage.value = 1
    loadBorrowHistory()
  }
})

// Load khi mounted
onMounted(() => {
  if (props.maDocGia) {
    loadBorrowHistory()
  } else {
    error.value = 'Không có mã độc giả'
  }
})
</script>

<style scoped>
.table-responsive {
  font-size: 0.875rem;
}
.badge {
  font-size: 0.75rem;
}
</style>