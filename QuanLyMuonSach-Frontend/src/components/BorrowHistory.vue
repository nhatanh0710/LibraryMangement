<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">📚 Lịch sử mượn sách</h5>
      <button class="btn btn-sm btn-outline-secondary" @click="load(1)">Làm mới</button>
    </div>

    <div v-if="loading" class="text-center py-3">Đang tải...</div>

    <table v-else class="table table-sm">
      <thead>
        <tr>
          <th>#</th>
          <th>Sách</th>
          <th>Ngày mượn</th>
          <th>Ngày dự kiến trả</th>
          <th>Ngày trả</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in items" :key="r._id || i">
          <td>{{ (page - 1) * limit + i + 1 }}</td>
          <td>{{ r.maSach?.tenSach || r.maSach || '—' }}</td>
          <td>{{ formatDate(r.ngayMuon) }}</td>
          <td>{{ formatDate(r.ngayDuKienTra) }}</td>
          <td>{{ formatDate(r.ngayTra) }}</td>
          <td>
            <span :class="r.trangThai === 'ĐÃ TRẢ' ? 'text-success' : 'text-warning'">{{ r.trangThai }}</span>
          </td>
        </tr>
        <tr v-if="!items.length">
          <td colspan="6" class="text-center text-muted">Không có phiếu mượn nào</td>
        </tr>
      </tbody>
    </table>

    <div v-if="meta.totalPages > 1" class="d-flex justify-content-between align-items-center">
      <div>Tổng: {{ meta.total || 0 }}</div>
      <div>
        <button class="btn btn-sm btn-outline-secondary me-2" @click="prevPage" :disabled="page <= 1">Prev</button>
        <span>Trang {{ page }} / {{ meta.totalPages }}</span>
        <button class="btn btn-sm btn-outline-secondary ms-2" @click="nextPage" :disabled="page >= meta.totalPages">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { fetchMuonSachs } from '@/services/muonSachService'

const props = defineProps({
  maDocGia: { type: String, required: true }
})

const items = ref([])
const meta = ref({ total: 0, totalPages: 1 })
const loading = ref(false)
const page = ref(1)
const limit = ref(10)

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

async function load(p = 1) {
  loading.value = true
  try {
    const res = await fetchMuonSachs(p, limit.value, { maDocGia: props.maDocGia })
    const body = res.data || res
    items.value = body.data || []
    meta.value = body.meta || { total: 0, totalPages: 1 }
    page.value = p
  } catch (err) {
    console.error('Load phiếu mượn lỗi:', err)
    items.value = []
  } finally {
    loading.value = false
  }
}

function prevPage() {
  if (page.value > 1) load(page.value - 1)
}
function nextPage() {
  if (page.value < (meta.value.totalPages || 1)) load(page.value + 1)
}

onMounted(() => load(1))
watch(() => props.maDocGia, () => load(1))
</script>
