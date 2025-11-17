<!-- src/views/UserHome.vue -->
<template>
  <div class="user-home">
     <!-- 2 nút điều hướng -->
    <div class="d-flex justify-content-end mb-3 gap-2">
      <router-link to="/docgia/muon-sach" class="btn btn-primary btn-sm ">
        📚 Lịch sử mượn sách
      </router-link>
      <router-link to="/docgia/chi-tiet-doc-gia/:id" class="btn btn-secondary btn-sm">
        👤 Thông tin cá nhân
      </router-link>
    </div>
    <!-- 🌟 Carousel sách nổi tiếng -->
    <div id="bookCarousel" class="carousel slide mb-4" data-bs-ride="carousel">
      <div class="carousel-inner rounded-3 shadow-sm">
        <div
          v-for="(banner, i) in banners"
          :key="i"
          :class="['carousel-item', { active: i === 0 }]"
        >
          <img :src="banner.image" class="d-block w-100" :alt="banner.title" />
          <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-2 p-2">
            <h5>{{ banner.title }}</h5>
            <p>{{ banner.author }}</p>
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

    <!-- 📚 Danh sách sách nổi bật -->
    <div class="container">
      <h3 class="mb-3 fw-bold text-primary">Sách nổi bật</h3>
      <div v-if="loading" class="text-center py-5">Đang tải sách...</div>
      <div v-else class="row g-4">
        <div class="col-sm-6 col-md-4 col-lg-3" v-for="book in featured" :key="book.maSach">
          <BookCard :book="book" @borrow="openBorrow" />
        </div>
      </div>
    </div>

    <!-- Modal mượn sách -->
   <TheoDoiMuonSach
  v-if="borrowModalOpen"
  :initial="formInitial"
  :docGias="[userStore.user]"   
  :saches="saches"
  @close="borrowModalOpen = false"
  @saved="onBorrowSuccess"
/>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BookCard from '@/components/Sach/BookCard.vue'
import TheoDoiMuonSach from '@/components/MuonSach/TheoDoiMuonSachForm.vue'
import api from '@/services/api'
import { useUserStore } from '@/stores/users'

const userStore = useUserStore()
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
const formInitial = ref({})

onMounted(async () => {
  loading.value = true
  try {
    const res = await api.get(`/sach?page=${page.value}`)
    featured.value = res.data?.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

function openBorrow(book) {
  selectedBook.value = book
  saches.value = [book] // chỉ có 1 quyển đang chọn
  formInitial.value = {
    maDocGia: userStore.user?._id, // id độc giả đang đăng nhập
    maSach: book._id || book.maSach,
  }
  borrowModalOpen.value = true
}


function onBorrowSuccess() {
  window.location.reload()
}
</script>

<style scoped>
.user-home {
  background-color: #f8fafb;
  min-height: 100vh;
}
.carousel-item img {
  height: 360px;
  object-fit: cover;
}
</style>
