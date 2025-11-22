<template>
  <div class="user-home">

    <!-- Carousel -->
    <div id="bookCarousel" class="carousel slide mb-4" data-bs-ride="carousel">
      <div class="carousel-inner" style="border-radius: var(--radius-xl);">
        <div
          v-for="(banner, i) in banners"
          :key="i"
          :class="['carousel-item', { active: i === 0 }]"
        >
          <img :src="banner.image" class="d-block w-100 carousel-img" :alt="banner.title" />
          <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-3 p-3">
            <h5>{{ banner.title }}</h5>
            <p class="mb-0">{{ banner.author }}</p>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#bookCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#bookCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
    </div>

    <!-- Danh sách sách -->
    <div class="container">
      <h3 class="mb-4 fw-bold text-primary">
        <i class="bi bi-stars me-2"></i>Sách nổi bật
      </h3>
      
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Đang tải sách...</p>
      </div>
      
      <div v-else class="row g-4">
        <div class="col-sm-6 col-md-4 col-lg-3" v-for="book in featured" :key="book.maSach">
          <BookCard :book="book" @borrow="openBorrow" />
        </div>
      </div>
    </div>

    <!-- Modal mượn sách -->
    <TheoDoiMuonSachForm
      v-if="borrowModalOpen"
      :visible="borrowModalOpen"
      :selected-book="selectedBook"
      :saches="saches"
      :user-info="userStore.user"
      role="user"
      @saved="onBorrowSuccess"
      @cancel="onBorrowCancel"
      @update:visible="borrowModalOpen = $event"
    />
  </div>
</template>

<script setup>
// Script giữ nguyên
import { ref, onMounted } from 'vue'
import BookCard from '@/components/Sach/BookCard.vue'
import TheoDoiMuonSachForm from '@/components/MuonSach/TheoDoiMuonSachForm.vue'
import api from '@/services/api'
import { useUserStore } from '@/stores/users'

const userStore = useUserStore()
const user = userStore.user || null

const banners = ref([
  { image: '/images/banner1.jpg', title: 'Harry Potter', author: 'J.K. Rowling' },
  { image: '/images/banner2.jpg', title: 'Doraemon', author: 'Fujiko F. Fujio' },
  { image: '/images/banner3.jpg', title: 'Sherlock Holmes', author: 'Arthur Conan Doyle' },
])

const featured = ref([])
const loading = ref(false)
const borrowModalOpen = ref(false)
const selectedBook = ref(null)
const page = ref(1)
const saches = ref([])

onMounted(async () => {
  await loadFeaturedBooks()
})

async function loadFeaturedBooks() {
  loading.value = true
  try {
    const res = await api.get(`/sach?page=${page.value}`)
    featured.value = res.data?.data || []
    saches.value = featured.value
  } catch (err) {
    console.error('Lỗi tải sách:', err)
  } finally {
    loading.value = false
  }
}

function openBorrow(book) {
  selectedBook.value = book
  borrowModalOpen.value = true
}

function onBorrowSuccess(savedData) {
  borrowModalOpen.value = false
  selectedBook.value = null
  alert('Đã gửi yêu cầu mượn sách thành công!')
}

function onBorrowCancel() {
  borrowModalOpen.value = false
  selectedBook.value = null
}
</script>

<style scoped>
.user-home {
  background-color: var(--background-light);
  min-height: 100vh;
  padding: var(--space-lg);
}

.carousel-img {
  height: 360px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .user-home {
    padding: var(--space);
  }
  
  .carousel-img {
    height: 250px;
  }
}
</style>