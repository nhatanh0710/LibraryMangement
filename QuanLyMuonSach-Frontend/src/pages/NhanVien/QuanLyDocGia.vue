<template>
  <div class="container py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Quản lý Độc giả</h3>
      <div>
        <button class="btn btn-primary me-2" @click="openAdd" :disabled="loading">Thêm Độc giả</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
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
              <button class="btn btn-sm btn-outline-primary me-2" @click="openEdit(dg)">Sửa</button>
              <button class="btn btn-sm btn-outline-danger" @click="handleDelete(dg)">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="alert alert-info">Không có độc giả.</div>

      <Pagination
        v-if="totalPages > 1"
        :page="page"
        :totalPages="totalPages"
        :limit="limit"
        :maxButtons="5"
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
import loadData from '@/utils/loadData.js'
import * as DocGiaService from '@/services/docGiaService.js'

// state
const docGias = ref([])
const loading = ref(false)
const showForm = ref(false)
const selected = ref(null)

const page = ref(1)
const limit = ref(5)
const total = ref(0)
const totalPages = ref(0)

// load với loadData (truyền refs để loadData cập nhật)
async function loadDocGias(p = 1) {
  try {
    await loadData(
      DocGiaService.fetchDocGias,
      docGias,
      p,
      limit.value,
      { loading, total, page, limit, totalPages }
    )
  } catch (err) {
    console.error('loadDocGias error:', err)
    alert(err?.response?.data?.message || 'Lỗi khi tải danh sách độc giả')
    docGias.value = []
    total.value = 0
    totalPages.value = 0
    page.value = 1
  }
}

function openAdd() {
  selected.value = null
  showForm.value = true
}

function openEdit(d) {
  selected.value = d
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  selected.value = null
}

function onSaved(saved) {
  if (!saved) { closeForm(); return }
  // saved có thể là object trực tiếp (server unwrap)
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
  if (!confirm(`Bạn có chắc muốn xóa độc giả "${(d.hoLot || '') + ' ' + (d.ten || '')}"?`)) return
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
  const nl = Number(l) || 5
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
