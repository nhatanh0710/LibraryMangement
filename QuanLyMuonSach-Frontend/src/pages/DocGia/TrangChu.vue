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

    <!-- Đoạn giới thiệu -->
    <div class="container mb-5">
      <div class="intro-section text-center">
        <h2 class="fw-bold mb-3 text-primary">Chào mừng đến với NA Library</h2>
        <p class="lead text-muted mb-4">
          Hệ thống quản lý thư viện hiện đại, nơi bạn có thể dễ dàng tìm kiếm, mượn và quản lý sách một cách thuận tiện. 
          Với kho sách đa dạng và công nghệ tiên tiến, chúng tôi mang đến trải nghiệm đọc sách tốt nhất cho bạn.
        </p>
        <div class="features-grid row g-4 mb-4">
          <div class="col-md-4">
            <div class="feature-item p-3">
              <i class="bi bi-search feature-icon"></i>
              <h5 class="mt-2">Tìm kiếm thông minh</h5>
              <p class="text-muted mb-0">Tìm sách nhanh chóng theo tên, tác giả, thể loại</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-item p-3">
              <i class="bi bi-clock-history feature-icon"></i>
              <h5 class="mt-2">Mượn trả dễ dàng</h5>
              <p class="text-muted mb-0">Quy trình mượn trả sách đơn giản và tiện lợi</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-item p-3">
              <i class="bi bi-graph-up feature-icon"></i>
              <h5 class="mt-2">Theo dõi lịch sử</h5>
              <p class="text-muted mb-0">Quản lý lịch sử mượn sách chi tiết</p>
            </div>
          </div>
        </div>
        <router-link to="/docgia/about" class="btn btn-outline-primary btn-lg">
          <i class="bi bi-info-circle me-2"></i>Tìm hiểu thêm về chúng tôi
        </router-link>
      </div>
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

.intro-section {
  padding: 2rem 0;
}

.feature-item {
  background: var(--surface-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  height: 100%;
  border: 1px solid var(--muted-200);
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow);
  border-color: var(--primary-300);
}

.feature-icon {
  font-size: 2.5rem;
  color: var(--primary-600);
  background: linear-gradient(135deg, var(--primary-100), var(--muted-100));
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.lead {
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .intro-section {
    padding: 1.5rem 0;
  }
  
  .feature-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
  
  .lead {
    font-size: 1.1rem;
  }
}
</style>