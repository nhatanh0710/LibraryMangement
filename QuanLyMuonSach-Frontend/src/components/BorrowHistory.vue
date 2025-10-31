<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Lịch sử / Phiếu mượn của {{ userDisplay }}</h5>
      <div>
        <button class="btn btn-sm btn-success" @click="openBorrow">Mượn sách</button>
        <button class="btn btn-sm btn-outline-secondary ms-2" @click="load(1)">Làm mới</button>
      </div>
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
          <th class="text-end">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in items" :key="r._id || i">
          <td>{{ (page-1)*limit + i + 1 }}</td>
          <td>{{ r.maSach?.tenSach || r.maSach || '—' }}</td>
          <td>{{ formatDate(r.ngayMuon) }}</td>
          <td>{{ formatDate(r.ngayDuKienTra) }}</td>
          <td>{{ formatDate(r.ngayTra) }}</td>
          <td>
            <span :class="r.trangThai === 'ĐÃ TRẢ' ? 'text-success' : 'text-warning'">{{ r.trangThai }}</span>
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" @click="editRecord(r)">Sửa</button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteRecord(r)" :disabled="deleting">Xóa</button>
          </td>
        </tr>

        <tr v-if="!items.length">
          <td colspan="7" class="text-center text-muted">Không có phiếu mượn</td>
        </tr>
      </tbody>
    </table>

    <div class="d-flex justify-content-between align-items-center">
      <div>Tổng: {{ meta.total || 0 }}</div>
      <div>
        <button class="btn btn-sm btn-outline-secondary me-2" @click="prevPage" :disabled="page<=1">Prev</button>
        <span class="mx-2">Trang {{ page }} / {{ meta.totalPages || 1 }}</span>
        <button class="btn btn-sm btn-outline-secondary ms-2" @click="nextPage" :disabled="page>= (meta.totalPages || 1)">Next</button>
      </div>
    </div>

    <!-- Modal tạo/sửa phiếu mượn -->
    <TheoDoiMuonSachForm
      v-if="showForm"
      :initial="formInitial"
      :docGias="docGias"
      :saches="saches"
      @close="closeForm"
      @saved="onSaved"
      :docGiasLoading="false"
      :sachesLoading="false"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { fetchMuonSachs, deleteMuonSach } from '@/services/muonSachService' // fetchMuonSachs(page,limit,filters)
import * as DocGiaService from '@/services/docGiaService'
import * as SachService from '@/services/bookService'
import TheoDoiMuonSachForm from '@/components/TheoDoiMuonSachForm.vue'

const props = defineProps({
  user: { type: Object, required: true } // pass full user object (from localStorage or store)
})

const user = props.user

const items = ref([])
const loading = ref(false)
const deleting = ref(false)
const page = ref(1)
const limit = ref(12)
const meta = ref({ total: 0, totalPages: 0 })

const showForm = ref(false)
const formInitial = ref(null)

// optional small caches for selects in the modal
const docGias = ref([]) // not strictly needed (we pass current user), but form expects docGias list
const saches = ref([])

// display name
const userDisplay = computed(() => {
  if (!user) return ''
  return (user.maDocGia ? user.maDocGia + ' — ' : '') + (user.hoLot ? `${user.hoLot} ${user.ten}` : (user.ten || user.name || ''))
})

// load lookups (books minimal) for the modal's select
async function loadLookups() {
  try {
    const [dgRes, sachRes] = await Promise.all([
      DocGiaService.fetchDocGias(1, 100), // adjust if you have fetchAllSmall
      SachService.fetchBooks(1, 100)
    ])
    docGias.value = (dgRes?.data || dgRes)?.data || (dgRes?.data || dgRes) || []
    saches.value = (sachRes?.data || sachRes)?.data || (sachRes?.data || sachRes) || []
  } catch (e) {
    // ignore
    docGias.value = []
    saches.value = []
  }
}

// load records for this user
async function load(p = 1) {
  if (!user) return
  loading.value = true
  try {
    // prefer sending ObjectId if available, else send maDocGia code
    const idOrCode = user._id || user.maDocGia
    // fetchMuonSachs should accept filters object { maDocGia: ... }
    const res = await fetchMuonSachs(p, limit.value, { maDocGia: idOrCode })
    const body = res.data || res
    items.value = body.data || []
    meta.value = body.meta || { total: 0, totalPages: 0 }
    page.value = p
  } catch (err) {
    console.error('load muon sach error', err)
    items.value = []
    meta.value = { total: 0, totalPages: 0 }
  } finally {
    loading.value = false
  }
}

function prevPage() { if (page.value > 1) load(page.value - 1) }
function nextPage() { if (page.value < (meta.value.totalPages || 1)) load(page.value + 1) }

// open modal to create a loan prefilled with this user
function openBorrow() {
  formInitial.value = {
    // prefill maDocGia as object or id depending on form expectation
    maDocGia: user._id || user.maDocGia || '',
    // leave maSach blank for selection
  }
  showForm.value = true
}

// edit an existing record (open modal with initial)
function editRecord(rec) {
  // pass the record as initial so modal populates fields
  formInitial.value = rec
  showForm.value = true
}

function closeForm() {
  formInitial.value = null
  showForm.value = false
}

// on saved reload list (rec is saved item)
function onSaved(saved) {
  closeForm()
  // optionally show toast
  // reload current page
  load(page.value)
}

// delete record (with confirmation)
async function deleteRecord(r) {
  if (!r || !r._id) return
  if (!confirm('Bạn có chắc muốn xóa phiếu mượn này?')) return
  deleting.value = true
  try {
    await deleteMuonSach(r._id)
    await load(page.value)
    alert('Xóa thành công')
  } catch (err) {
    console.error('delete error', err)
    alert(err?.response?.data?.message || 'Xóa thất bại')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await loadLookups()
  load(1)
})

// if parent changes user, reload data
watch(() => props.user, () => {
  load(1)
})
</script>

<style scoped>
.table td, .table th { vertical-align: middle; }
</style>
