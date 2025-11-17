<template>
  <div class="container py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Quản lý Nhà Xuất Bản</h3>
      <div>
        <button class="btn btn-primary me-2" @click="openAdd" :disabled="loading">Thêm Nhà xuất Bản</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-else>
      <table class="table table-striped align-middle" v-if="nxbList.length">
        <thead class="table-dark">
          <tr>
            <th style="width:48px">#</th>
            <th>Mã NXB</th>
            <th>Tên NXB</th>
            <th>Địa chỉ</th>
            <th class="text-end">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(nxb, idx) in nxbList" :key="nxb._id || nxb.maNXB || idx">
            <td>{{ (page - 1) * limit + idx + 1 }}</td>
            <td>{{ nxb.maNXB }}</td>
            <td>{{ nxb.tenNXB }}</td>
            <td>{{ nxb.diaChi || '—' }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-primary me-2" @click="openEdit(nxb)">Sửa</button>
              <button class="btn btn-sm btn-outline-danger" @click="handleDeleteNXB(nxb)">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="alert alert-info">Không có Nhà Xuất Bản.</div>

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

    <NXBForm v-if="showForm" :initial="selectedNXB" @close="closeForm" @saved="onSaved" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NXBForm from '@/components/NXBForm.vue'
import Pagination from '@/components/Home/Pagination.vue'
import loadData from '@/utils/loadData.js'
import * as NXBService from '@/services/nxbService.js'

// state + pagination refs
const nxbList = ref([])
const loading = ref(false)
const showForm = ref(false)
const selectedNXB = ref(null)

const page = ref(1)
const limit = ref(10)
const total = ref(0)
const totalPages = ref(0)

// load dùng loadData (truyền refs để loadData cập nhật loading/total/page/limit/totalPages)
async function loadNXBs(p = 1) {
  try {
    await loadData(NXBService.fetchNXBs, nxbList, p, limit.value, {
      loading, total, page, limit, totalPages
    })
  } catch (err) {
    console.error('loadNXBs error', err)
    alert(err?.response?.data?.message || 'Lỗi khi tải danh sách NXB')
    nxbList.value = []
    total.value = 0
    totalPages.value = 0
    page.value = 1
  }
}

// lifecycle
onMounted(() => loadNXBs(1))

// modal controls
function openAdd() {
  selectedNXB.value = null
  showForm.value = true
}
function openEdit(nxb) {
  selectedNXB.value = nxb
  showForm.value = true
}
function closeForm() {
  showForm.value = false
  selectedNXB.value = null
}

// when NXBForm emits saved
function onSaved(saved) {
  if (!saved) {
    // fallback: reload if backend didn't return object
    loadNXBs(page.value)
    closeForm()
    return
  }

  const item = saved?.data ?? saved
  const idx = nxbList.value.findIndex(x => x._id === item._id)
  if (idx >= 0) nxbList.value.splice(idx, 1, item)
  else nxbList.value.unshift(item)

  if (nxbList.value.length > limit.value) nxbList.value.splice(limit.value)
  closeForm()
}

// delete (check + reload current page to keep paging consistent)
async function handleDeleteNXB(nxb) {
  if (!nxb?._id) return alert('NXB không hợp lệ')
  if (!confirm(`Bạn có chắc muốn xóa Nhà xuất bản "${nxb.tenNXB}"?`)) return

  try {
    loading.value = true
    await NXBService.deleteNXB(nxb._id)
    // reload current page (an toàn với paging)
    await loadNXBs(page.value)
    alert('Xóa thành công')
  } catch (err) {
    console.error('Xóa NXB lỗi', err)
    alert(err?.response?.data?.message || 'Xóa thất bại')
  } finally {
    loading.value = false
  }
}

// pagination handlers
function changePage(p) {
  const np = Number(p) || 1
  if (np === page.value) return
  page.value = np
  loadNXBs(page.value)
}
function changeLimit(l) {
  const nl = Number(l) || 10
  if (nl === limit.value) return
  limit.value = nl
  page.value = 1
  loadNXBs(1)
}
function onPageChange({ page: p, limit: l } = {}) {
  if (p) changePage(p)
  if (l) changeLimit(l)
}
</script>

<style scoped>
.container { max-width: 1100px; }
.table td, .table th { vertical-align: middle; }
</style>
