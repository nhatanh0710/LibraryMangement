<template>
  <div class="borrow-history-section">
    <div class="section-header">
      <h6 class="section-title">
        <i class="bi bi-clock-history"></i>
        Lịch sử mượn sách
      </h6>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="loading-text">Đang tải lịch sử mượn sách...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <i class="bi bi-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button class="btn btn-sm btn-outline-primary" @click="loadBorrowHistory">
          <i class="bi bi-arrow-clockwise"></i>
          Thử lại
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="bi bi-inbox"></i>
        <p class="empty-text">Chưa có lịch sử mượn sách</p>
        <small class="text-muted">Các phiếu mượn sách sẽ xuất hiện ở đây</small>
      </div>
    </div>

    <!-- Data table -->
    <div v-else class="history-content">
      <div class="table-container">
        <table class="history-table">
          <thead>
            <tr>
              <th class="book-info">Sách mượn</th>
              <th class="date-info">Ngày mượn</th>
              <th class="date-info">Hạn trả</th>
              <th class="date-info">Ngày trả</th>
              <th class="status-col">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item._id" class="history-item">
              <td class="book-info">
                <div class="book-details">
                  <div class="book-code">{{ item.maSach?.maSach || '—' }}</div>
                  <div class="book-title">{{ item.maSach?.tenSach || '—' }}</div>
                </div>
              </td>
              <td class="date-info">
                <div class="date-cell">
                  <i class="bi bi-calendar-plus"></i>
                  {{ formatDate(item.ngayMuon) }}
                </div>
              </td>
              <td class="date-info">
                <div class="date-cell" :class="{ 'overdue': isOverdue(item) }">
                  <i class="bi bi-calendar-check"></i>
                  {{ formatDate(item.ngayDuKienTra) }}
                </div>
              </td>
              <td class="date-info">
                <div class="date-cell" :class="{ 'returned': item.ngayTra }">
                  <i class="bi bi-calendar-event"></i>
                  {{ formatDate(item.ngayTra) || '—' }}
                </div>
              </td>
              <td class="status-col">
                <span :class="`status-badge ${getStatusClass(item.trangThai)}`">
                  <i :class="getStatusIcon(item.trangThai)"></i>
                  {{ item.trangThai }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta && meta.totalPages > 1" class="pagination-section">
        <div class="pagination-info">
          <small class="text-muted">
            Hiển thị {{ getDisplayRange() }} của {{ meta.total }} phiếu mượn
          </small>
        </div>
        <div class="pagination-controls">
          <button 
            class="btn-pagination prev"
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
          >
            <i class="bi bi-chevron-left"></i>
            Trước
          </button>
          
          <div class="page-numbers">
            <span class="current-page">{{ currentPage }}</span>
            <span class="page-separator">/</span>
            <span class="total-pages">{{ meta.totalPages }}</span>
          </div>
          
          <button 
            class="btn-pagination next"
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

// Kiểm tra quá hạn
function isOverdue(item) {
  if (item.trangThai === 'QUÁ HẠN') return true
  if (item.trangThai === 'ĐANG MƯỢN' && item.ngayDuKienTra) {
    return new Date(item.ngayDuKienTra) < new Date()
  }
  return false
}

// Class cho trạng thái
function getStatusClass(status) {
  const statusMap = {
    'CHỜ DUYỆT': 'status-pending',
    'ĐÃ DUYỆT': 'status-approved',
    'ĐANG MƯỢN': 'status-borrowing',
    'ĐÃ TRẢ': 'status-returned',
    'QUÁ HẠN': 'status-overdue'
  }
  return statusMap[status] || 'status-default'
}

// Icon cho trạng thái
function getStatusIcon(status) {
  const iconMap = {
    'CHỜ DUYỆT': 'bi-clock',
    'ĐÃ DUYỆT': 'bi-check-circle',
    'ĐANG MƯỢN': 'bi-book',
    'ĐÃ TRẢ': 'bi-check-lg',
    'QUÁ HẠN': 'bi-exclamation-triangle'
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
  background: var(--surface-white);
  border-radius: var(--radius-lg);
  padding: 0;
}

.section-header {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--muted-200);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--primary-800);
  font-weight: 600;
  margin: 0;
  font-size: 1.1rem;
}

.section-title i {
  color: var(--primary-700);
}

/* Loading state */
.loading-state {
  padding: var(--space-xl);
  text-align: center;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space);
}

.loading-text {
  color: var(--text-muted);
  margin: 0;
}

/* Error state */
.error-state {
  padding: var(--space-xl);
  text-align: center;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space);
}

.error-content i {
  font-size: 2rem;
  color: var(--warning-500);
}

.error-content p {
  color: var(--text-medium);
  margin: 0;
}

/* Empty state */
.empty-state {
  padding: var(--space-xl);
  text-align: center;
}

.empty-content i {
  font-size: 3rem;
  color: var(--muted-300);
  margin-bottom: var(--space);
}

.empty-text {
  color: var(--text-medium);
  font-weight: 500;
  margin-bottom: var(--space-xs);
}

/* Table styles */
.history-content {
  padding: var(--space-lg);
}

.table-container {
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--muted-200);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface-white);
}

.history-table th {
  background: var(--muted-100);
  padding: var(--space-md);
  font-weight: 600;
  color: var(--text-dark);
  text-align: left;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--muted-200);
}

.history-table td {
  padding: var(--space-md);
  border-bottom: 1px solid var(--muted-100);
  vertical-align: top;
}

.history-item:last-child td {
  border-bottom: none;
}

.history-item:hover {
  background: var(--muted-50);
}

/* Column widths */
.book-info { width: 30%; }
.date-info { width: 18%; }
.status-col { width: 16%; }

/* Book info styles */
.book-details {
  line-height: 1.4;
}

.book-code {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.book-title {
  font-weight: 500;
  color: var(--text-dark);
  font-size: 0.9rem;
}

/* Date styles */
.date-cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.875rem;
  color: var(--text-medium);
}

.date-cell i {
  color: var(--muted-300);
}

.date-cell.overdue {
  color: var(--error-500);
  font-weight: 500;
}

.date-cell.overdue i {
  color: var(--error-500);
}

.date-cell.returned {
  color: var(--success-500);
}

.date-cell.returned i {
  color: var(--success-500);
}

/* Status badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 4px 8px;
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-pending {
  background: rgba(var(--warning-500-rgb), 0.1);
  color: var(--warning-700);
  border: 1px solid rgba(var(--warning-500-rgb), 0.3);
}

.status-approved {
  background: rgba(var(--info-500-rgb), 0.1);
  color: var(--info-700);
  border: 1px solid rgba(var(--info-500-rgb), 0.3);
}

.status-borrowing {
  background: rgba(var(--primary-500-rgb), 0.1);
  color: var(--primary-700);
  border: 1px solid rgba(var(--primary-500-rgb), 0.3);
}

.status-returned {
  background: rgba(var(--success-500-rgb), 0.1);
  color: var(--success-700);
  border: 1px solid rgba(var(--success-500-rgb), 0.3);
}

.status-overdue {
  background: rgba(var(--error-500-rgb), 0.1);
  color: var(--error-700);
  border: 1px solid rgba(var(--error-500-rgb), 0.3);
}

.status-default {
  background: var(--muted-200);
  color: var(--text-muted);
  border: 1px solid var(--muted-300);
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--muted-200);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.btn-pagination {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 6px 12px;
  border: 1px solid var(--muted-300);
  background: var(--surface-white);
  color: var(--text-medium);
  border-radius: var(--radius);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.btn-pagination:hover:not(:disabled) {
  background: var(--primary-700);
  color: white;
  border-color: var(--primary-700);
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
}

.current-page {
  font-weight: 600;
  color: var(--primary-700);
}

.total-pages {
  color: var(--text-muted);
}

.page-separator {
  color: var(--muted-300);
}

/* Responsive */
@media (max-width: 768px) {
  .history-content {
    padding: var(--space);
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .history-table {
    min-width: 600px;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: var(--space);
    align-items: stretch;
  }
  
  .pagination-controls {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .section-header {
    padding: var(--space);
  }
  
  .history-content {
    padding: var(--space-sm);
  }
  
  .history-table th,
  .history-table td {
    padding: var(--space-sm);
  }
}
</style>