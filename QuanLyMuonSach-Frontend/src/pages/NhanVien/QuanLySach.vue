<template>
  <div class="container py-3">
    <div class="d-flex justify-content-between mb-3 align-items-center">
      <h3 class="mb-0">Danh sách sách</h3>
      <div>
        <button class="btn btn-primary me-2" @click="openAdd" :disabled="loading">Thêm sách mới</button>
        <!-- không cần nút tải lại theo yêu cầu trước, nhưng vẫn để reload fn nếu cần -->
      </div>
    </div>

    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else>
      <table v-if="books.length" class="table table-striped table-bordered align-middle">
        <thead class="table-dark">
          <tr>
            <th style="width:80px">Mã</th>
            <th>Tên</th>
            <th style="width:110px">Năm XB</th>
            <th style="width:110px">Số quyển</th>
            <th>Tác giả</th>
            <th style="width:160px" class="text-end">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(book, idx) in books" :key="book._id || book.maSach || idx">
            <td>{{ book.maSach }}</td>
            <td>{{ book.tenSach }}</td>
            <td>{{ book.namXuatBan ?? '-' }}</td>
            <td>{{ book.soQuyen ?? '-' }}</td>
            <td>{{ book.nguonGoc_tacGia ?? '-' }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-primary me-2" @click="openEdit(book)" :disabled="loading">Sửa</button>
              <button class="btn btn-sm btn-danger" @click="handleDeleteBook(book)" :disabled="loading">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-muted">Không có sách. Nhấn "Thêm sách" để bắt đầu.</div>

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

    <BookForm
      v-if="showForm"
      :initial="selected"
      @close="closeForm"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BookForm from '@/components/Sach/BookForm.vue'
import Pagination from '@/components/Home/Pagination.vue'
import loadData from '@/utils/loadData.js'
import * as bookService from '@/services/bookService'

// state + pagination refs
const books = ref([])
const loading = ref(false)
const showForm = ref(false)
const selected = ref(null)

const page = ref(1)
const limit = ref(10)
const total = ref(0)
const totalPages = ref(0)

// load dùng loadData (truyền refs để loadData cập nhật loading/total/page/limit/totalPages)
async function loadBooks(p = 1) {
  try {
    await loadData(bookService.fetchBooks, books, p, limit.value, {
      loading, total, page, limit, totalPages
    })
  } catch (err) {
    console.error('loadBooks error', err)
    alert(err?.response?.data?.message || 'Lỗi khi tải danh sách sách')
    books.value = []
    total.value = 0
    totalPages.value = 0
    page.value = 1
  }
}

// lifecycle
onMounted(() => loadBooks(1))

// modal controls
function openAdd() {
  selected.value = null
  showForm.value = true
}
function openEdit(book) {
  selected.value = JSON.parse(JSON.stringify(book)) // clone an toàn
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  selected.value = null
}

// when BookForm emits saved
function onSaved(saved) {
  if (!saved) {
    // backend didn't return object -> reload safe
    loadBooks(page.value)
    closeForm()
    return
  }

  const item = saved?.data ?? saved
  const idx = books.value.findIndex(b => b._id === item._id)
  if (idx >= 0) books.value.splice(idx, 1, item)
  else books.value.unshift(item)

  // keep page size
  if (books.value.length > limit.value) books.value.splice(limit.value)
  closeForm()
}

// delete
async function handleDeleteBook(book) {
  if (!book?._id) return alert('Sách không hợp lệ')
  if (!confirm(`Xác nhận xóa sách "${book.tenSach}"?`)) return

  try {
    loading.value = true
    await bookService.deleteBook(book._id)
    // safest: reload current page to keep paging consistent
    await loadBooks(page.value)
    alert('Xóa thành công')
  } catch (err) {
    console.error('Xóa sách lỗi', err)
    alert(err?.response?.data?.message || 'Lỗi khi xóa sách')
  } finally {
    loading.value = false
  }
}

// pagination handlers
function changePage(p) {
  const np = Number(p) || 1
  if (np === page.value) return
  page.value = np
  loadBooks(page.value)
}
function changeLimit(l) {
  const nl = Number(l) || 10
  if (nl === limit.value) return
  limit.value = nl
  page.value = 1
  loadBooks(1)
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
