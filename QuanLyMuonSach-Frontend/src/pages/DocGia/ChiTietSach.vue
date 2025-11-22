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
        <div class="card book-detail-card">
          <div class="row g-0">
            <!-- Hình ảnh -->
            <div class="col-md-4">
              <div class="book-image-container">
                <img 
                  :src="book.hinhAnh || '/images/book-placeholder.png'" 
                  :alt="book.tenSach"
                  class="book-image"
                  @error="handleImageError"
                />
                <div v-if="book.soQuyenConLai === 0" class="out-of-stock-badge">
                  <i class="bi bi-x-circle me-1"></i>Hết sách
                </div>
                <div v-else-if="canBorrow" class="in-stock-badge">
                  <i class="bi bi-check-circle me-1"></i>Có sẵn
                </div>
              </div>
            </div>

            <!-- Thông tin chi tiết -->
            <div class="col-md-8">
              <div class="card-body h-100 d-flex flex-column">
                <!-- Header với title và mã sách -->
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h1 class="book-title">{{ book.tenSach || '—' }}</h1>
                  <span class="book-code">{{ book.maSach || '—' }}</span>
                </div>
                
                <!-- Thông tin cơ bản -->
                <div class="book-meta mb-4">
                  <div class="meta-item">
                    <i class="bi bi-person-fill me-2"></i>
                    <span class="meta-label">Tác giả:</span>
                    <span class="meta-value">{{ book.nguonGoc_tacGia || 'Đang cập nhật' }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="bi bi-building me-2"></i>
                    <span class="meta-label">Nhà xuất bản:</span>
                    <span class="meta-value">{{ book.maNXB?.tenNXB || book.maNXB || '—' }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="bi bi-calendar3 me-2"></i>
                    <span class="meta-label">Năm xuất bản:</span>
                    <span class="meta-value">{{ book.namXuatBan || '—' }}</span>
                  </div>
                </div>

                <!-- Tình trạng và giá -->
                <div class="book-status-section mb-4">
                  <div class="d-flex flex-wrap gap-3 align-items-center">
                    <div class="price-tag">
                      {{ formatPrice(book.donGia) }}
                    </div>
                    <div class="stock-info" :class="{ 'text-success': canBorrow, 'text-danger': !canBorrow }">
                      <i class="bi me-2" :class="canBorrow ? 'bi-check-circle' : 'bi-x-circle'"></i>
                      {{ book.soQuyenConLai || 0 }}/{{ book.soQuyen || 0 }} quyển có sẵn
                    </div>
                  </div>
                </div>

                <!-- Mô tả -->
                <div class="book-description mb-4 flex-grow-1">
                  <h6 class="section-title">
                    <i class="bi bi-text-paragraph me-2"></i>Mô tả sách
                  </h6>
                  <div class="description-content">
                    <p class="description-text">{{ book.moTa || 'Chưa có mô tả cho sách này.' }}</p>
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="action-buttons mt-auto">
                  <button 
                    class="btn btn-primary btn-lg me-2" 
                    :disabled="!canBorrow"
                    @click="openBorrow"
                  >
                    <i class="bi bi-cart-plus me-2"></i>
                    {{ canBorrow ? 'Mượn sách ngay' : 'Hết sách' }}
                  </button>
                  <button class="btn btn-outline-secondary btn-lg" @click="goBack">
                    <i class="bi bi-arrow-left me-2"></i>
                    Quay lại
                  </button>
                </div>

                <!-- Warning message -->
                <div v-if="!canBorrow" class="alert alert-warning mt-3 mb-0">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  Sách tạm thời hết hàng. Vui lòng quay lại sau.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lịch sử mượn sách -->
        <div class="card mt-4 history-card">
          <div class="card-header bg-light">
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
              <i class="bi bi-inbox display-6 d-block mb-2 opacity-50"></i>
              <p class="mb-0">Chưa có lịch sử mượn sách</p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover table-striped">
                <thead class="table-light">
                  <tr>
                    <th width="50">#</th>
                    <th>Độc giả</th>
                    <th>Ngày mượn</th>
                    <th>Ngày trả dự kiến</th>
                    <th>Ngày trả thực tế</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(record, index) in borrowHistory" :key="record._id">
                    <td class="text-muted">{{ index + 1 }}</td>
                    <td>
                      <div class="reader-info">
                        <span class="fw-semibold">{{ record.maDocGia?.hoLot }} {{ record.maDocGia?.ten }}</span>
                        <small class="text-muted d-block">{{ record.maDocGia?.maDocGia }}</small>
                      </div>
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

      <!-- Sidebar thông tin bổ sung -->
      <div class="col-lg-4">
        <div class="card info-sidebar">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="bi bi-info-circle me-2"></i>
              Thông tin bổ sung
            </h6>
          </div>
          <div class="card-body">
            <div class="info-item">
              <i class="bi bi-shield-check text-success me-2"></i>
              <span>Đảm bảo chất lượng sách</span>
            </div>
            <div class="info-item">
              <i class="bi bi-truck text-primary me-2"></i>
              <span>Giao sách miễn phí trong thư viện</span>
            </div>
            <div class="info-item">
              <i class="bi bi-headset text-info me-2"></i>
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>

        <div class="card mt-3 quick-actions-card">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="bi bi-lightning me-2"></i>
              Thao tác nhanh
            </h6>
          </div>
          <div class="card-body">
            <button class="btn btn-outline-primary w-100 mb-2">
              <i class="bi bi-heart me-2"></i>Thêm vào yêu thích
            </button>
            <button class="btn btn-outline-secondary w-100">
              <i class="bi bi-share me-2"></i>Chia sẻ sách
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form mượn sách -->
    <TheoDoiMuonSachForm
      v-if="showBorrowForm"
      :visible="showBorrowForm"
      :selected-book="book"
      :user-info="userStore.user"
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
import TheoDoiMuonSachForm from '@/components/MuonSach/TheoDoiMuonSachForm.vue'
import { useUserStore } from '@/stores/users'


const route = useRoute()
const router = useRouter()
const bookId = route.params.id

const userStore = useUserStore()
const book = ref({})
const borrowHistory = ref([])
const loading = ref(true)
const loadingHistory = ref(false)
const showBorrowForm = ref(false)

const canBorrow = computed(() => {
  return (book.value.soQuyenConLai ?? 0) > 0
})

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
    'QUÁ HẠN': 'bg-danger text-white',
    'ĐÃ HỦY': 'bg-secondary text-white'
  }
  return statusMap[status] || 'bg-secondary text-white'
}

function handleImageError(event) {
  event.target.src = '/images/book-placeholder.png'
}

function goBack() {
  router.back()
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
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  background: var(--surface-white);
}

.book-image-container {
  position: relative;
  height: 100%;
  min-height: 350px;
  background: var(--muted-100);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.book-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 300px;
  border-radius: var(--radius);
}

.out-of-stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--error-500);
  color: white;
  padding: 6px 12px;
  border-radius: var(--radius);
  font-size: 0.8rem;
  font-weight: 500;
}

.in-stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--success-500);
  color: white;
  padding: 6px 12px;
  border-radius: var(--radius);
  font-size: 0.8rem;
  font-weight: 500;
}

.book-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-900);
  margin-bottom: 0;
  line-height: 1.3;
}

.book-code {
  background: var(--muted-200);
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-family: monospace;
}

.book-meta .meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  color: var(--text-medium);
}

.meta-label {
  font-weight: 500;
  min-width: 120px;
  color: var(--text-dark);
}

.meta-value {
  color: var(--text-medium);
}

.book-status-section {
  padding: 1rem;
  background: var(--muted-100);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary-500);
}

.price-tag {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--success-500);
}

.stock-info {
  font-weight: 500;
}

.section-title {
  color: var(--primary-800);
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.description-content {
  background: var(--muted-100);
  padding: 1rem;
  border-radius: var(--radius);
  border-left: 3px solid var(--accent-300);
}

.description-text {
  color: var(--text-medium);
  line-height: 1.7;
  white-space: pre-line;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.history-card {
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.reader-info {
  line-height: 1.4;
}

.info-sidebar,
.quick-actions-card {
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.info-sidebar .card-header,
.quick-actions-card .card-header {
  background: var(--muted-100);
  border-bottom: 1px solid var(--muted-200);
  padding: 1rem 1.25rem;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--muted-200);
}

.info-item:last-child {
  border-bottom: none;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 2rem;
}

.breadcrumb-item a {
  color: var(--primary-700);
  transition: color var(--transition-fast);
}

.breadcrumb-item a:hover {
  color: var(--primary-800);
}

.breadcrumb-item.active {
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .book-title {
    font-size: 1.5rem;
  }
  
  .book-code {
    display: none;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .meta-item {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .meta-label {
    min-width: auto;
    margin-bottom: 0.25rem;
  }
}

@media (max-width: 576px) {
  .book-image-container {
    min-height: 250px;
  }
  
  .book-status-section {
    text-align: center;
  }
  
  .price-tag {
    font-size: 1.25rem;
  }
}
</style>