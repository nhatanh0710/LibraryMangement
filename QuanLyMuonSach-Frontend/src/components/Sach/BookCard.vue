<template>
  <div class="book-card" @click="openDetail" role="button">
    <div class="book-cover">
      <img :src="book.hinhAnh || placeholder" :alt="book.tenSach" />
      <div v-if="book.soQuyenConLai === 0" class="out-of-stock">Hết sách</div>
    </div>

    <div class="book-info">
      <h6 class="book-title">{{ book.tenSach }}</h6>
      <p class="book-author">{{ book.nguonGoc_tacGia || 'Tác giả không rõ' }}</p>
      <p class="book-price">{{ formatPrice(book.donGia) }}</p>
      
      <button class="borrow-btn" @click.stop="onBorrowClick" :disabled="book.soQuyenConLai === 0">
        {{ book.soQuyenConLai === 0 ? 'Hết sách' : 'Mượn ngay' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({ book: { type: Object, required: true } })
const emits = defineEmits(['borrow'])
const router = useRouter()
const placeholder = '/images/book-placeholder.png'

function openDetail() {
  router.push({ name: 'ChiTietSach', params: { id: props.book._id } })
}

function onBorrowClick(event) {
  event.stopPropagation()
  emits('borrow', props.book)
}

function formatPrice(v) {
  return v ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫' : 'Miễn phí'
}
</script>

<style scoped>
.book-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.book-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover img {
  transform: scale(1.05);
}

.out-of-stock {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.book-info {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.book-price {
  color: #116466;
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.borrow-btn {
  background: #116466;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-top: auto;
}

.borrow-btn:hover:not(:disabled) {
  background: #0d4d4f;
  transform: translateY(-1px);
}

.borrow-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}
</style>