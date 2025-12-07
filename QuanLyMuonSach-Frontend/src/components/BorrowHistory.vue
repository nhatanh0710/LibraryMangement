<template>
  <div class="borrow-history-section">
    <!-- Header Section -->
    <div class="section-header border-bottom p-3 p-lg-4 bg-light">
      <h2 class="section-title m-0 text-dark">
        <i class="bi bi-clock-history text-primary me-2"></i>
        Lịch sử mượn sách
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state text-center py-5 bg-white">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-secondary">Đang tải lịch sử mượn sách...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state text-center py-5 bg-white">
      <div class="alert alert-warning d-inline-flex align-items-center" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
      </div>
      <button class="btn btn-outline-primary mt-3" @click="loadBorrowHistory">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Thử lại
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="empty-state text-center py-5 bg-white">
      <div class="empty-icon mb-3">
        <i class="bi bi-journal-x text-secondary" style="font-size: 3rem;"></i>
      </div>
      <h5 class="text-secondary mb-2">Chưa có lịch sử mượn sách</h5>
      <p class="text-secondary mb-0">Bạn chưa mượn sách nào từ thư viện.</p>
    </div>

    <!-- Data Table -->
    <div v-else class="history-content p-3 p-lg-4 bg-white">
      <!-- Responsive Table Container -->
      <div class="table-responsive rounded border">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-3 text-dark">Sách mượn</th>
              <th scope="col" class="text-dark">Ngày mượn</th>
              <th scope="col" class="text-dark">Hạn trả</th>
              <th scope="col" class="text-dark">Ngày trả</th>
              <th scope="col" class="text-dark">Trạng thái</th>
              <th scope="col" class="pe-3 text-dark">Số ngày trễ & Phạt</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item._id" class="border-top">
              <!-- Book Info -->
              <td class="ps-3">
                <div class="text-dark">
                  <div class="text-muted small fw-medium">{{ item.maSach?.maSach || '—' }}</div>
                  <div class="fw-semibold text-dark">{{ item.maSach?.tenSach || '—' }}</div>
                  <div v-if="item.maSach?.tacGia" class="text-secondary small">
                    {{ item.maSach.tacGia }}
                  </div>
                </div>
              </td>

              <!-- Dates -->
              <td>
                <div class="d-flex align-items-center gap-2 text-dark">
                  <i class="bi bi-calendar-plus"></i>
                  <span>{{ formatDate(item.ngayMuon) }}</span>
                </div>
              </td>

              <td>
                <div :class="['d-flex align-items-center gap-2', { 'text-danger fw-semibold': isOverdue(item) }]">
                  <i class="bi bi-calendar-check"></i>
                  <span :class="{ 'text-danger': isOverdue(item) }">
                    {{ formatDate(item.ngayDuKienTra) }}
                  </span>
                </div>
              </td>

              <td>
                <div :class="['d-flex align-items-center gap-2', item.ngayTra ? 'text-success' : 'text-secondary']">
                  <i class="bi bi-calendar-event"></i>
                  <span>{{ formatDate(item.ngayTra) || '—' }}</span>
                </div>
              </td>

              <!-- Status -->
              <td>
                <span :class="`badge ${getStatusBadgeClass(item.trangThai)} d-inline-flex align-items-center gap-1`">
                  <i :class="getStatusIcon(item.trangThai)"></i>
                  {{ item.trangThai }}
                </span>
              </td>

              <!-- Late Info -->
              <td class="pe-3">
                <div v-if="item.soNgayTre > 0" class="late-info">
                  <div :class="['d-flex align-items-center gap-1 mb-1', item.ngayTra ? 'text-danger' : 'text-warning']">
                    <i class="bi bi-clock-exclamation"></i>
                    <span class="fw-medium">{{ item.soNgayTre }} ngày</span>
                    <span v-if="!item.ngayTra" class="badge bg-danger ms-1">
                      Đang trễ
                    </span>
                  </div>
                  <div v-if="item.tienPhat > 0" class="text-danger d-flex align-items-center gap-1">
                    <i class="bi bi-cash-coin"></i>
                    <span class="fw-medium">{{ formatCurrency(item.tienPhat) }}</span>
                  </div>
                  <div v-else class="text-muted small d-flex align-items-center gap-1">
                    <i class="bi bi-info-circle"></i>
                    <span>Đang chờ tính phí</span>
                  </div>
                </div>
                <div v-else class="text-success d-flex align-items-center gap-1">
                  <i class="bi bi-check-circle"></i>
                  <span>Không phạt</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta && meta.totalPages > 1" 
           class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top gap-3">
        <div>
          <small class="text-secondary">
            Hiển thị {{ getDisplayRange() }} của {{ meta.total }} phiếu mượn
          </small>
        </div>
        
        <div class="d-flex align-items-center gap-2">
          <button 
            class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
          >
            <i class="bi bi-chevron-left"></i>
            Trước
          </button>
          
          <div class="px-3">
            <span class="fw-semibold text-primary">{{ currentPage }}</span>
            <span class="text-secondary mx-1">/</span>
            <span class="text-secondary">{{ meta.totalPages }}</span>
          </div>
          
          <button 
            class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
            :disabled="currentPage >= meta.totalPages"
            @click="changePage(currentPage + 1)"
          >
            Sau
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
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
    const response = await api.get('/theodoimuonsach', {
      params: {
        maDocGia: props.maDocGia,
        page: currentPage.value,
        limit: 10
      }
    })

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
  if (!dateString) return null
  try { 
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) 
  } catch { 
    return dateString 
  }
}

// Kiểm tra quá hạn
function isOverdue(item) {
  return item.treHan === true || 
         item.trangThai === 'HẾT HẠN' || 
         item.trangThai === 'QUÁ HẠN' ||
         item.trangThai === 'TRỄ HẠN'
}

// Format tiền
function formatCurrency(amount) {
  if (!amount || amount <= 0) return '0 đ'
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ'
}

// Bootstrap badge classes
function getStatusBadgeClass(status) {
  const statusMap = {
    'CHỜ DUYỆT': 'bg-warning text-dark',
    'ĐÃ DUYỆT': 'bg-primary text-white',
    'ĐÃ TRẢ': 'bg-success text-white',
    'HẾT HẠN': 'bg-danger text-white',
    'TRẢ TRỄ': 'bg-success text-white'
  }
  return statusMap[status] || 'bg-secondary text-white'
}

// Bootstrap icons
function getStatusIcon(status) {
  const iconMap = {
    'CHỜ DUYỆT': 'bi-clock',
    'ĐÃ DUYỆT': 'bi-check-circle',
    'ĐÃ TRẢ': 'bi-check-lg',
    'HẾT HẠN': 'bi-exclamation-triangle',
    'TRẢ TRỄ': 'bi-exclamation-triangle',
  }
  return iconMap[status] || 'bi-question-circle'
}

// Hiển thị range
function getDisplayRange() {
  if (!meta.value) return ''
  const start = (currentPage.value - 1) * 10 + 1
  const end = Math.min(currentPage.value * 10, meta.value.total)
  return `${start}-${end}`
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
.borrow-history-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
}

.section-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
}

/* Loading, Error, Empty states */
.loading-state,
.error-state,
.empty-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
}

/* Table improvements */
.table th {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #495057;
  padding-top: 1rem;
  padding-bottom: 1rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  padding-top: 1rem;
  padding-bottom: 1rem;
  vertical-align: middle;
  border-color: #e9ecef;
  color: #212529;
}

.table-hover tbody tr:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

/* Badge custom */
.badge {
  padding: 0.4rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 6px;
}

/* Late info styling */
.late-info .badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .borrow-history-section {
    border-radius: 8px;
  }
  
  .table-responsive {
    border-radius: 6px;
    border: 1px solid #dee2e6;
  }
  
  .section-header {
    padding: 1rem !important;
  }
  
  .history-content {
    padding: 1rem !important;
  }
  
  .table th,
  .table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 576px) {
  .section-title {
    font-size: 1.1rem;
  }
  
  .badge {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .table th {
    font-size: 0.75rem;
  }
  
  .table td {
    font-size: 0.8125rem;
  }
}
</style>