<template>
  <div class="search-bar">
    <div class="search-input-container">
      <div class="input-group">
        <!-- Input tìm kiếm -->
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          placeholder="Tìm kiếm sách theo tên, mã sách, tác giả..."
          @input="onInputChange"
          @focus="showSuggestions = true"
          @blur="onBlur"
          ref="searchInput"
        >
        
        <!-- Nút tìm kiếm -->
        <button 
          class="btn btn-primary" 
          type="button" 
          @click="performSearch"
          :disabled="!searchQuery.trim()"
        >
          <i class="bi bi-search"></i>
        </button>

        <!-- Nút xóa -->
        <button 
          v-if="searchQuery" 
          class="btn btn-outline-secondary" 
          type="button" 
          @click="clearSearch"
          title="Xóa tìm kiếm"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>

    <!-- Danh sách gợi ý -->
    <div 
      v-if="showSuggestions && suggestions.length > 0 && searchQuery.trim()" 
      class="suggestions-dropdown"
    >
      <div class="suggestions-list">
        <div
          v-for="book in suggestions"
          :key="book._id"
          class="suggestion-item"
          @mousedown="selectBook(book)"
        >
          <div class="suggestion-content">
            <img 
              :src="book.hinhAnh || '/images/book-placeholder.png'" 
              :alt="book.tenSach"
              class="suggestion-image"
            />
            <div class="suggestion-text">
              <div class="suggestion-title" v-html="highlightMatch(book.tenSach)"></div>
              <div class="suggestion-details">
                <span class="suggestion-author" v-html="highlightMatch(book.nguonGoc_tacGia)"></span>
                <span class="suggestion-divider">•</span>
                <span class="suggestion-code" v-html="highlightMatch(book.maSach)"></span>
              </div>
              <div class="suggestion-meta">
                <span class="suggestion-price">{{ formatPrice(book.donGia) }}</span>
                <span class="suggestion-divider">•</span>
                <span class="suggestion-stock">Còn {{ book.soQuyenConLai || 0 }} quyển</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const searchQuery = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
const searchInput = ref(null)
const debounceTimer = ref(null)
const loading = ref(false)

// Tìm kiếm tự động khi nhập
async function onInputChange() {
  clearTimeout(debounceTimer.value)
  
  const query = searchQuery.value.trim()
  if (!query) {
    suggestions.value = []
    return
  }

  if (query.length < 2) {
    suggestions.value = []
    return
  }

  loading.value = true
  debounceTimer.value = setTimeout(async () => {
    try {
      const response = await api.get('/sach', {
        params: { 
          search: query, 
          limit: 8 // Giới hạn số kết quả gợi ý
        }
      })
      
      if (response.data.success) {
        suggestions.value = response.data.data
      } else {
        suggestions.value = []
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error)
      suggestions.value = []
    } finally {
      loading.value = false
    }
  }, 300)
}

// Highlight kết quả trùng khớp
function highlightMatch(text) {
  if (!text || !searchQuery.value.trim()) return text
  
  const query = searchQuery.value.trim()
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return String(text).replace(regex, '<mark>$1</mark>')
}

// Chọn sách từ gợi ý
function selectBook(book) {
  router.push(`/docgia/chi-tiet-sach/${book._id}`)
  clearSearch()
}

// Tìm kiếm toàn bộ
function performSearch() {
  const query = searchQuery.value.trim()
  if (!query) return

  router.push({
    name: 'SearchResults',
    query: { q: query }
  })
  showSuggestions.value = false
}

function clearSearch() {
  searchQuery.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

function onBlur() {
  // Delay ẩn suggestions để cho phép click
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function formatPrice(price) {
  if (!price) return '—'
  return new Intl.NumberFormat('vi-VN').format(price) + ' ₫'
}

// Cho phép nhấn Enter để tìm kiếm
function onKeydown(event) {
  if (event.key === 'Enter') {
    performSearch()
  }
}

// Thêm event listener cho keydown
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  if (searchInput.value) {
    searchInput.value.addEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  if (searchInput.value) {
    searchInput.value.removeEventListener('keydown', onKeydown)
  }
})
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-input-container .input-group {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-input-container .form-control {
  border: none;
  padding: 10px 16px;
  font-size: 0.9rem;
}

.search-input-container .form-control:focus {
  box-shadow: none;
  border: none;
}

.search-input-container .btn {
  border: none;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Suggestions Dropdown */
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  margin-top: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.suggestions-list {
  padding: 8px 0;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.suggestion-image {
  width: 40px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-weight: 500;
  color: #212529;
  margin-bottom: 4px;
  line-height: 1.3;
}

.suggestion-details {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 0.875rem;
}

.suggestion-author {
  color: #6c757d;
  flex-shrink: 0;
}

.suggestion-divider {
  color: #adb5bd;
}

.suggestion-code {
  color: #495057;
  font-family: monospace;
  background: #f8f9fa;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.suggestion-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
}

.suggestion-price {
  color: #28a745;
  font-weight: 500;
}

.suggestion-stock {
  color: #6c757d;
}

.suggestions-footer {
  padding: 8px 16px;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

/* Highlight style */
:deep(mark) {
  background-color: #fff3cd;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 600;
}

/* Loading state */
.search-bar.loading .suggestions-dropdown::before {
  content: "Đang tải...";
  display: block;
  padding: 12px 16px;
  color: #6c757d;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .search-bar {
    max-width: 100%;
  }
  
  .suggestions-dropdown {
    position: fixed;
    top: auto;
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-height: 60vh;
  }
}
</style>