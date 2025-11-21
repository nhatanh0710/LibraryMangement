<template>
  <!-- Component hiển thị thẻ sách -->
  <div class="book-card card h-100 shadow-sm border-0" @click="openDetail" role="button">
    <!-- cover book hoặc placeholder -->
    <img :src="book.hinhAnh || placeholder" class="card-img-top" alt="cover" />

    <div class="card-body d-flex flex-column">
      <!-- tên sách -->
      <h6 class="card-title fw-semibold mb-1 text-dark">{{ book.tenSach }}</h6>
      <!-- tác giả -->
      <p class="text-muted small mb-2">{{ book.nguonGoc_tacGia || 'Tác giả không rõ' }}</p>
      <!-- giá -->
      <p class="fw-bold text-primary mb-3">{{ formatPrice(book.donGia) }}</p>

      <!-- nút mượn -->
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

// click vào thẻ chuyển đến trang chi tiết sách
function openDetail() {
  // Sử dụng _id thay vì maSach vì router đang dùng id
  router.push({ name: 'ChiTietSach', params: { id: props.book._id } })
}
// click nút Mượn ngay emit sự kiện lên parent
function onBorrowClick(event) {
  event.stopPropagation() // Ngăn sự kiện nổi lên parent
  emits('borrow', props.book)
}
// format giá tiền theo vi-VN
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
  cursor: pointer;
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
.btn-primary {
  background-color: #116466;
  border-color: #116466;
}
.btn-primary:hover {
  background-color: #0d4d4f;
  border-color: #0d4d4f;
}
</style>