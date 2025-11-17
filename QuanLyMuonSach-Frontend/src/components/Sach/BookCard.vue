<!-- src/components/BookCard.vue -->
<template>
  <div class="book-card card h-100 shadow-sm border-0" @click="openDetail" role="button">
    <img :src="book.image || placeholder" class="card-img-top" alt="cover" />
    <div class="card-body d-flex flex-column">
      <h6 class="card-title fw-semibold mb-1 text-dark">{{ book.tenSach }}</h6>
      <p class="text-muted small mb-2">{{ book.tacGia || 'Tác giả không rõ' }}</p>
      <p class="fw-bold text-primary mb-3">{{ formatPrice(book.donGia) }}</p>
      <div class="mt-auto text-center">
        <button class="btn btn-primary btn-sm px-3" @click.stop="onBorrowClick">
          Mượn ngay
        </button>
      </div>
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
  router.push({ path: `/books/${props.book.maSach}` })
}
function onBorrowClick() {
  emits('borrow', props.book)
}
function formatPrice(v) {
  return v ? new Intl.NumberFormat('vi-VN').format(v) + ' ₫' : '—'
}
</script>

<style scoped>
.book-card {
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.25s ease;
  background-color: #ffffff;
}
.book-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}
.card-img-top {
  height: 200px;
  object-fit: cover;
  border-bottom: 3px solid #116466;
}
.btn-outline-primary {
  border-color: #116466;
  color: #116466;
}
.btn-outline-primary:hover {
  background-color: #116466;
  color: white;
}
</style>
