<template>
  <div>
    <div class="d-flex justify-content-between mb-3">
      <h3>Danh sách sách</h3>
      <button class="btn btn-success" @click="openAdd" :disabled="loading">Thêm sách</button>
    </div>

    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>

    <div v-else>
      <table v-if="books.length" class="table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên</th>
            <th>Năm XB</th>
            <th>Số quyển</th>
            <th>Tác giả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book._id">
            <td>{{ book.maSach }}</td>
            <td>{{ book.tenSach }}</td>
            <td>{{ book.namXuatBan || '-' }}</td>
            <td>{{ book.soQuyen }}</td>
            <td>{{ book.tacGia }}</td>
            <td>
              <button class="btn btn-sm btn-primary me-2" @click="openEdit(book)" :disabled="loading">Sửa</button>
              <button class="btn btn-sm btn-danger" @click="deleteBook(book)" :disabled="loading">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!books.length" class="text-muted">
        Không có sách. Nhấn "Thêm sách" để bắt đầu.
      </div>
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
import * as bookService from '@/services/bookService'
import BookForm from '@/components/BookForm.vue'

const books = ref([])
const showForm = ref(false)
const selected = ref(null)
const loading = ref(false)

async function load() {
  try {
    loading.value = true
    // fetchBooks returns payload (array of books)
    const data = await bookService.fetchBooks()
    books.value = Array.isArray(data) ? data : (data?.items || [])
  } catch (err) {
    console.error('Load books error', err)
    alert(err.response?.data?.message || 'Lỗi khi tải danh sách sách')
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openAdd() {
  selected.value = null
  showForm.value = true
}

function openEdit(book) {
  selected.value = { ...book }
  showForm.value = true
}

async function deleteBook(book) {
  if (!confirm('Xác nhận xóa sách ' + book.tenSach + '?')) return
  try {
    loading.value = true
    await bookService.deleteBook(book._id)
    const idx = books.value.findIndex(b => b._id === book._id)
    if (idx >= 0) books.value.splice(idx, 1)
    alert('Xóa thành công')
  } catch (err) {
    console.error('Xóa sách lỗi', err)
    alert(err.response?.data?.message || 'Lỗi khi xóa sách')
  } finally {
    loading.value = false
  }
}

function closeForm() {
  showForm.value = false
}

// onSaved receives a book object (from BookForm)
function onSaved(bookObj) {
  if (!bookObj || !bookObj._id) { load(); showForm.value = false; return }
  const idx = books.value.findIndex(b => b._id === bookObj._id)
  if (idx >= 0) books.value.splice(idx, 1, bookObj)
  else books.value.unshift(bookObj)
  showForm.value = false
}
</script>
