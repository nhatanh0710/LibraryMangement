<!-- src/DocGia/ChiTietSach.vue -->
<template>
  <div class="container my-4">
    <div class="row">
      <div class="col-lg-8">
        <div class="card mb-3">
          <div class="row g-0">
            <div class="col-md-4">
              <img :src="book.image || '/images/book-placeholder.png'" class="img-fluid rounded-start" alt="cover" />
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h3 class="card-title">{{ book.tenSach || '—' }}</h3>
                <p class="mb-1"><strong>Tác giả / Nguồn:</strong> {{ book.tacGia || book.nguonGoc || '—' }}</p>
                <p class="mb-1"><strong>Nhà xuất bản:</strong> {{ book.tenNXB || book.maNXB || '—' }}</p>
                <p class="mb-1"><strong>Năm XB:</strong> {{ book.namXuatBan || '—' }}</p>
                <p class="mb-1"><strong>Đơn giá:</strong> {{ formatPrice(book.donGia) }}</p>
                <p class="mb-1"><strong>Số quyển:</strong> {{ book.soQuyen ?? '—' }}</p>
                <p class="mt-2">{{ book.moTa }}</p>

                <div class="mt-3">
                  <button class="btn btn-success me-2" :disabled="!canBorrow" @click="openBorrow">Mượn sách</button>
                  <router-link to="/books" class="btn btn-outline-secondary">Quay về danh sách</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <h5>Lịch sử mượn (quyển này)</h5>
            <div v-if="loadingHistory" class="text-muted">Đang tải...</div>
            <table v-else class="table table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Độc giả</th>
                  <th>Ngày mượn</th>
                  <th>Ngày trả</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in bookHistory" :key="r._id || i">
                  <td>{{ i+1 }}</td>
                  <td>
                    <router-link :to="`/user/profile/${r.maDocGia}`">{{ r.tenDocGia || r.maDocGia }}</router-link>
                  </td>
                  <td>{{ formatDate(r.ngayMuon) }}</td>
                  <td>{{ formatDate(r.ngayTra) }}</td>
                  <td>{{ r.daTra ? 'Đã trả' : 'Đang mượn' }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="!bookHistory.length && !loadingHistory" class="text-muted">Chưa có giao dịch.</div>
          </div>
        </div>
      </div>

      <aside class="col-lg-4">
        <AccountPanel />
      </aside>
    </div>

    <!-- modal form: nếu bạn đã có TheoDoiMuonSachForm.vue dùng thay BorrowForm -->
    <component
      v-if="borrowOpen"
      :is="TheoDoiMuonSachFormComponent"
      :book="book"
      @close="closeBorrow"
      @success="onBorrowSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import AccountPanel from '@/components/AccountPanel.vue'
import BorrowHistory from '@/components/BorrowHistory.vue' // if needed
// component name for your form (you have TheoDoiMuonSachForm.vue)
import TheoDoiMuonSachForm from '@/components/TheoDoiMuonSachForm.vue'

const route = useRoute()
const router = useRouter()
const id = route.params.id || route.params.maSach

const book = ref({})
const bookHistory = ref([])
const loading = ref(false)
const loadingHistory = ref(false)
const borrowOpen = ref(false)
const TheoDoiMuonSachFormComponent = TheoDoiMuonSachForm

function formatPrice(v){
  if(v==null) return '—'
  return new Intl.NumberFormat('vi-VN').format(v)+' ₫'
}
function formatDate(d){
  if(!d) return '—'
  try{ return new Date(d).toLocaleDateString('vi-VN') }catch{ return d }
}

const canBorrow = computed(() => {
  return (book.value.soQuyen ?? 0) > 0
})

onMounted(async () => {
  if(!id) { router.push('/') ; return }
  loading.value = true
  try {
    const res = await api.get(`/sach/${id}`)
    book.value = res.data?.data || res.data || {}
  } catch(e) {
    console.error(e)
  } finally { loading.value = false }
  await loadHistory()
})

async function loadHistory(){
  loadingHistory.value = true
  try {
    const res = await api.get(`/muon/book/${id}`)
    bookHistory.value = res.data?.data || res.data || []
  } catch(e) {
    console.error(e)
    bookHistory.value = []
  } finally { loadingHistory.value = false }
}

function openBorrow(){
  borrowOpen.value = true
}
function closeBorrow(){ borrowOpen.value = false }
function onBorrowSuccess(){
  // refresh history and decrease count
  loadHistory()
  // refetch book to update soQuyen
  api.get(`/sach/${id}`).then(r => book.value = r.data?.data || r.data || {}).catch(()=>{})
  borrowOpen.value = false
}
</script>

<style scoped>
img { max-height: 320px; object-fit: cover; width:100%; }
</style>
