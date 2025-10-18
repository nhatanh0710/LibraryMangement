<template>
  <div class="modal-backdrop">
    <div class="modal d-block" tabindex="-1">
      <div class="modal-dialog">
        <form @submit.prevent="submit">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEdit ? 'Sửa sách' : 'Thêm sách' }}</h5>
              <button type="button" class="btn-close" @click="$emit('close')"></button>
            </div>

            <div class="modal-body">
              <!-- Mã sách -->
              <div class="mb-2">
                <label class="form-label">Mã sách</label>
                <input v-model="form.maSach" class="form-control" required />
              </div>

              <!-- Tên sách -->
              <div class="mb-2">
                <label class="form-label">Tên sách</label>
                <input v-model="form.tenSach" class="form-control" required />
              </div>

              <!-- Năm xuất bản + Số quyển -->
              <div class="row">
                <div class="col mb-2">
                  <label class="form-label">Năm xuất bản</label>
                  <input v-model.number="form.namXuatBan" type="number" class="form-control" />
                </div>
                <div class="col mb-2">
                  <label class="form-label">Số quyển</label>
                  <input v-model.number="form.soQuyen" type="number" class="form-control" required />
                </div>
              </div>

              <!-- Tác giả -->
              <div class="mb-2">
                <label class="form-label">Tác giả</label>
                <input v-model="form.tacGia" class="form-control" required />
              </div>

              <!-- Đơn giá -->
              <div class="mb-2">
                <label class="form-label">Đơn giá</label>
                <input v-model.number="form.donGia" type="number" class="form-control" />
              </div>

              <!-- Mô tả -->
              <div class="mb-2">
                <label class="form-label">Mô tả</label>
                <textarea v-model="form.moTa" class="form-control" rows="3"></textarea>
              </div>

              <!-- Hình ảnh -->
              <div class="mb-3">
                <label class="form-label">Hình ảnh (tải lên hoặc URL)</label>
                <input type="file" accept="image/*" @change="onFileChange" class="form-control mb-2" />
                <div v-if="preview" class="d-flex align-items-center mt-2">
                  <img :src="preview" alt="Preview" style="max-width:150px; max-height:200px; margin-right:10px" @error="imgError" />
                  <button type="button" class="btn btn-outline-danger btn-sm" @click="clearImage">Xóa</button>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">Hủy</button>
              <button type="submit" class="btn btn-primary">{{ isEdit ? 'Cập nhật' : 'Thêm' }}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, toRaw, onUnmounted } from 'vue'
import { createBook, updateBook } from '@/services/bookService'

const props = defineProps({
  initial: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

const isEdit = computed(() => !!props.initial)

const form = reactive({
  maSach: '',
  tenSach: '',
  donGia: 0,
  soQuyen: 1,
  namXuatBan: null,
  maNXB: null,
  tacGia: '',
  soQuyenConLai: 1,
  moTa: '',
  hinhAnh: ''
})

// Gán dữ liệu ban đầu nếu sửa
if (props.initial) {
  Object.assign(form, props.initial)
}

// Preview + file
const preview = ref(null)
const selectedFile = ref(null)
let currentObjectUrl = null

// Khởi tạo preview hình cũ khi sửa
if (props.initial && props.initial.hinhAnh) {
  preview.value = props.initial.hinhAnh.startsWith('http')
    ? props.initial.hinhAnh
    : `http://localhost:5000/${props.initial.hinhAnh}`
  form.hinhAnh = props.initial.hinhAnh
}

// Xử lý file chọn mới
function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
  selectedFile.value = file
  currentObjectUrl = URL.createObjectURL(file)
  preview.value = currentObjectUrl
  form.hinhAnh = '' // backend sẽ nhận file mới
}

// Xóa hình
function clearImage() {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
  selectedFile.value = null
  preview.value = null
  form.hinhAnh = ''
  currentObjectUrl = null
}

// Submit form
async function submit() {
  try {
    const fd = new FormData()
    const payload = toRaw(form)
    Object.keys(payload).forEach(key => {
      const val = payload[key]
      if (val === undefined || val === null) return
      fd.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val))
    })

    if (selectedFile.value) fd.append('file', selectedFile.value)

    const bookObj = isEdit.value
      ? await updateBook(props.initial._id, fd)
      : await createBook(fd)

    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null

    emit('saved', bookObj)
  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message || 'Lỗi khi lưu sách')
  }
}

function imgError(e) {
  e.target.src = 'https://via.placeholder.com/120x160?text=No+Image'
}

onUnmounted(() => {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>
