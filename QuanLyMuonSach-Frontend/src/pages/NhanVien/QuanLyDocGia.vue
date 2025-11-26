<template>
  <div class="container py-3">
    <!-- Header với Search -->
    <div class="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-3">
      <h3 class="mb-0">Quản lý Độc giả</h3>
      <div class="d-flex gap-2 align-items-center flex-wrap">
        <!-- Search Box -->
        <SearchBox 
          placeholder="Tìm theo mã, tên, địa chỉ, điện thoại..."
          @search="handleSearch"
        />
        <button class="btn btn-primary" @click="openAdd">
          <i class="bi bi-plus-circle me-1"></i>Thêm Độc giả
        </button>
      </div>
    </div>

    <!-- Search Results Info -->
    <div v-if="searchQuery" class="alert alert-info py-2 mb-3">
      <div class="d-flex justify-content-between align-items-center">
        <span>
          <i class="bi bi-search me-1"></i>
          Kết quả tìm kiếm cho: "<strong>{{ searchQuery }}</strong>"
          ({{ total }} kết quả)
        </span>
        <button class="btn btn-sm btn-outline-secondary" @click="clearSearch">
          <i class="bi bi-x me-1"></i>Xóa tìm kiếm
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
      <p class="mt-2 text-muted">Đang tải...</p>
    </div>

    <div v-else>
      <table class="table table-striped align-middle" v-if="docGias.length">
        <thead class="table-dark">
          <tr>
            <th style="width:48px">#</th>
            <th>Mã độc giả</th>
            <th>Họ tên</th>
            <th>Địa chỉ</th>
            <th>Điện thoại</th>
            <th class="text-end">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dg, idx) in docGias" :key="dg._id || dg.maDocGia || idx">
            <td>{{ (page - 1) * limit + idx + 1 }}</td>
            <td>{{ dg.maDocGia }}</td>
            <td>{{ (dg.hoLot || '') + ' ' + (dg.ten || '') }}</td>
            <td>{{ dg.diaChi || '—' }}</td>
            <td>{{ dg.dienThoai || '—' }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-accent me-2" @click="openEdit(dg)">Sửa</button>
              <button class="btn btn-sm btn-danger" @click="handleDelete(dg)">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-center py-5">
        <div v-if="searchQuery" class="text-muted">
          <i class="bi bi-search display-4 text-muted mb-3"></i>
          <p>Không tìm thấy độc giả phù hợp với "<strong>{{ searchQuery }}</strong>"</p>
          <button class="btn btn-outline-primary" @click="clearSearch">
            Hiển thị tất cả độc giả
          </button>
        </div>
        <div v-else class="alert alert-info">
          Không có độc giả. Nhấn "Thêm Độc giả" để bắt đầu.
        </div>
      </div>

      <Pagination
        v-if="totalPages > 1"
        :page="page"
        :totalPages="totalPages"
        :limit="limit"
        :totalItems="total"
        @update:page="changePage"
        @update:limit="changeLimit"
        @change="onPageChange"
      />
    </div>

    <DocGiaForm
      v-if="showForm"
      :initial="selected"
      @close="closeForm"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DocGiaForm from '@/components/DocGiaForm.vue'
import Pagination from '@/components/Home/Pagination.vue'
import SearchBox from '@/components/SearchBox.vue'
import loadData from '@/utils/loadData.js'
import * as DocGiaService from '@/services/docGiaService.js'

// state
const docGias = ref([])
const loading = ref(false)
const showForm = ref(false)
const selected = ref(null)
const searchQuery = ref('')

const page = ref(1)
const limit = ref(10)
const total = ref(0)
const totalPages = ref(0)

// Hàm load với search
async function loadDocGias(p = 1) {
  try {
    if (searchQuery.value) {
      // Sử dụng search service
      const result = await DocGiaService.searchDocGias(searchQuery.value, p, limit.value)
      docGias.value = result.data || []
      total.value = result.meta?.total || 0
      totalPages.value = Math.ceil(total.value / limit.value)
      page.value = p
    } else {
      // Sử dụng loadData bình thường
      await loadData(
        DocGiaService.fetchDocGias,
        docGias,
        p,
        limit.value,
        { loading, total, page, limit, totalPages }
      )
    }
  } catch (err) {
    console.error('loadDocGias error:', err)
    alert(err?.response?.data?.message || 'Lỗi khi tải danh sách độc giả')
    docGias.value = []
    total.value = 0
    totalPages.value = 0
    page.value = 1
  }
}

// Search handlers
function handleSearch(query) {
  searchQuery.value = query
  page.value = 1
  loadDocGias(1)
}

function clearSearch() {
  searchQuery.value = ''
  page.value = 1
  loadDocGias(1)
}

function openAdd() {
  selected.value = null
  showForm.value = true
}

function openEdit(d) {
  selected.value = JSON.parse(JSON.stringify(d)) // Clone an toàn
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  selected.value = null
}

function onSaved(saved) {
  if (!saved) {
    // Reload để cập nhật danh sách
    loadDocGias(page.value)
    closeForm()
    return
  }

  const item = saved?.data ?? saved
  const idx = docGias.value.findIndex(x => x._id === item._id)
  if (idx !== -1) docGias.value.splice(idx, 1, item)
  else docGias.value.unshift(item)

  if (docGias.value.length > limit.value) docGias.value.splice(limit.value)
  closeForm()
}

async function handleDelete(d) {
  if (!d || !d._id) {
    alert('Độc giả không hợp lệ')
    return
  }
  
  const fullName = (d.hoLot || '') + ' ' + (d.ten || '')
  if (!confirm(`Bạn có chắc muốn xóa độc giả "${fullName}"?`)) return
  
  try {
    loading.value = true
    await DocGiaService.deleteDocGia(d._id)
    await loadDocGias(page.value)
    alert('Xóa thành công')
  } catch (err) {
    console.error('Xóa docgia lỗi', err)
    alert(err?.response?.data?.message || 'Xóa thất bại')
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  const np = Number(p) || 1
  if (np === page.value) return
  page.value = np
  loadDocGias(page.value)
}

function changeLimit(l) {
  const nl = Number(l) || 10
  if (nl === limit.value) return
  limit.value = nl
  page.value = 1
  loadDocGias(1)
}

function onPageChange({ page: p, limit: l } = {}) {
  if (p) changePage(p)
  if (l) changeLimit(l)
}

onMounted(() => loadDocGias(1))
</script>

<style scoped>
.container { max-width: 1100px; }
.table td, .table th { vertical-align: middle; }
</style>