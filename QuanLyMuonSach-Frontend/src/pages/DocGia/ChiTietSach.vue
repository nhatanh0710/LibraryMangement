<template>
  <div class="container py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/" class="text-decoration-none">Trang chủ</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link to="/sach" class="text-decoration-none">Danh sách sách</router-link>
        </li>
        <li class="breadcrumb-item active">{{ book.tenSach || 'Chi tiết sách' }}</li>
      </ol>
    </nav>

    <div class="row">
      <!-- Thông tin sách -->
      <div class="col-lg-8">
        <div class="card book-detail-card shadow-sm">
          <div class="row g-0">
            <!-- Hình ảnh -->
            <div class="col-md-4">
              <div class="book-image-container">
                <img 
                  :src="book.hinhAnh || '/images/book-placeholder.png'" 
                  :alt="book.tenSach"
                  class="book-image"
                />
                <div v-if="book.soQuyenConLai === 0" class="out-of-stock-badge">
                  Hết sách
                </div>
              </div>
            </div>

            <!-- Thông tin chi tiết -->
            <div class="col-md-8">
              <div class="card-body h-100 d-flex flex-column">
                <h1 class="book-title">{{ book.tenSach || '—' }}</h1>
                
                <div class="book-meta mb-3">
                  <div class="meta-item">
                    <i class="bi bi-person me-2"></i>
                    <strong>Tác giả:</strong> {{ book.nguonGoc_tacGia || '—' }}
                  </div>
                  <div class="meta-item">
                    <i class="bi bi-building me-2"></i>
                    <strong>Nhà xuất bản:</strong> {{ book.maNXB?.tenNXB || book.maNXB || '—' }}
                  </div>
                  <div class="meta-item">
                    <i class="bi bi-calendar me-2"></i>
                    <strong>Năm xuất bản:</strong> {{ book.namXuatBan || '—' }}
                  </div>
                  <div class="meta-item">
                    <i class="bi bi-upc-scan me-2"></i>
                    <strong>Mã sách:</strong> <code>{{ book.maSach || '—' }}</code>
                  </div>
                </div>

                <div class="book-pricing mb-3">
                  <div class="price-tag">
                    {{ formatPrice(book.donGia) }}
                  </div>
                  <div class="stock-info">
                    <i class="bi bi-book" :class="{ 'text-success': canBorrow, 'text-danger': !canBorrow }"></i>
                    {{ book.soQuyenConLai || 0 }}/{{ book.soQuyen || 0 }} quyển có sẵn
                  </div>
                </div>

                <div class="book-description mb-4">
                  <h6>Mô tả</h6>
                  <p class="description-text">{{ book.moTa || 'Chưa có mô tả.' }}</p>
                </div>

                <div class="action-buttons mt-auto">
                  <button 
                    class="btn btn-primary btn-lg me-2" 
                    :disabled="!canBorrow"
                    @click="openBorrow"
                  >
                    <i class="bi bi-cart-plus me-2"></i>
                    Mượn sách ngay
                  </button>
                  <router-link to="/docgia/trang-chu" class="btn btn-outline-secondary btn-lg">
                    <i class="bi bi-arrow-left me-2"></i>
                    Quay lại
                  </router-link>
                </div>

                <div v-if="!canBorrow" class="alert alert-warning mt-3 mb-0">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  Sách tạm thời hết hàng. Vui lòng quay lại sau.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lịch sử mượn sách -->
        <div class="card mt-4">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-clock-history me-2"></i>
              Lịch sử mượn sách
            </h5>
          </div>
          <div class="card-body">
            <div v-if="loadingHistory" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
              <p class="mt-2 text-muted">Đang tải lịch sử mượn sách...</p>
            </div>
            
            <div v-else-if="borrowHistory.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-inbox display-6 d-block mb-2"></i>
              Chưa có lịch sử mượn sách
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Độc giả</th>
                    <th>Ngày mượn</th>
                    <th>Ngày trả dự kiến</th>
                    <th>Ngày trả thực tế</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(record, index) in borrowHistory" :key="record._id">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <span class="fw-semibold">{{ record.maDocGia?.hoLot }} {{ record.maDocGia?.ten }}</span>
                      <br>
                      <small class="text-muted">{{ record.maDocGia?.maDocGia }}</small>
                    </td>
                    <td>{{ formatDate(record.ngayMuon) }}</td>
                    <td>{{ formatDate(record.ngayDuKienTra) }}</td>
                    <td>
                      <span :class="{ 'text-success': record.ngayTra, 'text-muted': !record.ngayTra }">
                        {{ formatDate(record.ngayTra) || 'Chưa trả' }}
                      </span>
                    </td>
                    <td>
                      <span :class="`badge ${getStatusClass(record.trangThai)}`">
                        {{ record.trangThai }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      
    </div>

    <!-- Form mượn sách -->
    <TheoDoiMuonSachForm
      v-if="showBorrowForm"
      :visible="showBorrowForm"
      :selected-book="book"
      role="user"
      @saved="onBorrowSuccess"
      @cancel="closeBorrowForm"
      @update:visible="showBorrowForm = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import AccountPanel from '@/components/Home/AccountPanel.vue'
import TheoDoiMuonSachForm from '@/components/MuonSach/TheoDoiMuonSachForm.vue'

const route = useRoute()
const router = useRouter()
const bookId = route.params.id

const book = ref({})
const borrowHistory = ref([])
const loading = ref(true)
const loadingHistory = ref(false)
const showBorrowForm = ref(false)

const canBorrow = computed(() => {
  return (book.value.soQuyenConLai ?? 0) > 0
})

// THÊM HÀM FORMAT PRICE VÀO ĐÂY
function formatPrice(price) {
  if (!price && price !== 0) return 'Miễn phí'
  return new Intl.NumberFormat('vi-VN').format(price) + ' ₫'
}

function formatDate(dateString) {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString('vi-VN')
  } catch {
    return dateString
  }
}

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

// Load book details
async function loadBookDetails() {
  loading.value = true
  try {
    const response = await api.get(`/sach/${bookId}`)
    if (response.data.success) {
      book.value = response.data.data
    } else {
      router.push('/docgia/trang-chu')
    }
  } catch (error) {
    console.error('Lỗi tải thông tin sách:', error)
    router.push('/docgia/trang-chu')
  } finally {
    loading.value = false
  }
}

// Load borrow history
async function loadBorrowHistory() {
  loadingHistory.value = true
  try {
    const response = await api.get('/theodoimuonsach', {
      params: { maSach: bookId, limit: 50 }
    })
    if (response.data.success) {
      borrowHistory.value = response.data.data
    }
  } catch (error) {
    console.error('Lỗi tải lịch sử mượn:', error)
    borrowHistory.value = []
  } finally {
    loadingHistory.value = false
  }
}

// Borrow functions
function openBorrow() {
  showBorrowForm.value = true
}

function closeBorrowForm() {
  showBorrowForm.value = false
}

function onBorrowSuccess() {
  showBorrowForm.value = false
  // Reload data to update stock
  loadBookDetails()
  loadBorrowHistory()
}

// Initialize
onMounted(() => {
  loadBookDetails()
  loadBorrowHistory()
})
</script>

<style scoped>
.book-detail-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.book-image-container {
  position: relative;
  height: 100%;
  min-height: 300px;
}

.book-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.out-of-stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.book-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.book-meta .meta-item {
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.book-pricing {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.price-tag {
  font-size: 1.5rem;
  font-weight: 700;
  color: #28a745;
}

.stock-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.book-description h6 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.description-text {
  color: #6c757d;
  line-height: 1.6;
  white-space: pre-line;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 1.5rem;
}

.breadcrumb-item a {
  color: #6c757d;
}

.breadcrumb-item.active {
  color: #495057;
}

/* Responsive */
@media (max-width: 768px) {
  .book-title {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>