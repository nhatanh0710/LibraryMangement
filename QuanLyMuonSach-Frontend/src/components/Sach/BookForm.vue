<template>
  <!-- Modal Thêm/Sửa sách -->
  <div class="modal-backdrop">
    <div class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered mx-auto">
        <form @submit.prevent="submit">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEdit ? 'Sửa sách' : 'Thêm sách' }}</h5>
              <button type="button" class="btn-close" @click="$emit('close')"></button>
            </div>

            <div class="modal-body">
              <div class="row">
                <!-- Cột trái -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Mã sách <span class="text-danger">*</span></label>
                    <input 
                      v-model="form.maSach" 
                      type="text" 
                      class="form-control" 
                      required
                      :readonly="isEdit"
                    >
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Tên sách <span class="text-danger">*</span></label>
                    <input 
                      v-model="form.tenSach" 
                      type="text" 
                      class="form-control" 
                      required
                    >
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Tác giả</label>
                    <input 
                      v-model="form.nguonGoc_tacGia" 
                      type="text" 
                      class="form-control"
                      placeholder="Nhập tên tác giả"
                    >
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Nhà xuất bản</label>
                    <select v-model="form.maNXB" class="form-select">
                      <option value="">Chọn nhà xuất bản</option>
                      <option v-for="nxb in nxbs" :key="nxb._id" :value="nxb._id">
                        {{ nxb.tenNXB }}
                      </option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Năm xuất bản</label>
                    <input 
                      v-model="form.namXuatBan" 
                      type="number" 
                      class="form-control"
                      min="1900"
                      :max="new Date().getFullYear()"
                    >
                  </div>
                </div>

                <!-- Cột phải -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Số quyển <span class="text-danger">*</span></label>
                    <input 
                      v-model="form.soQuyen" 
                      type="number" 
                      class="form-control" 
                      required
                      min="1"
                    >
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Số quyển còn lại</label>
                    <input 
                      v-model="form.soQuyenConLai" 
                      type="number" 
                      class="form-control"
                      min="0"
                      :max="form.soQuyen"
                    >
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Đơn giá (VNĐ)</label>
                    <input 
                      v-model="form.donGia" 
                      type="number" 
                      class="form-control"
                      min="0"
                    >
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Hình ảnh</label>
                    <input 
                      type="file" 
                      @change="onFileChange" 
                      class="form-control" 
                      accept="image/*"
                      ref="fileInput"
                    >
                    
                    <!-- Preview image -->
                    <div v-if="imagePreview" class="mt-2">
                      <img 
                        :src="imagePreview" 
                        class="img-thumbnail" 
                        style="max-height: 150px; max-width: 100%;"
                        @error="handleImageError"
                      >
                      <button 
                        type="button" 
                        class="btn btn-sm btn-outline-danger mt-1" 
                        @click="clearImage"
                      >
                        <i class="bi bi-trash"></i> Xóa ảnh
                      </button>
                    </div>
                    
                    <!-- Hiển thị ảnh hiện tại nếu có -->
                    <div v-else-if="form.hinhAnh && !selectedFile" class="mt-2">
                      <img 
                        :src="form.hinhAnh" 
                        class="img-thumbnail" 
                        style="max-height: 150px; max-width: 100%;"
                        @error="handleImageError"
                      >
                      <div class="text-muted small mt-1">Ảnh hiện tại</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mô tả -->
              <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea 
                  v-model="form.moTa" 
                  class="form-control" 
                  rows="3"
                  placeholder="Nhập mô tả về sách..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')" :disabled="loading">
                Hủy
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                {{ isEdit ? 'Cập nhật' : 'Thêm' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  initial: Object
})

const emit = defineEmits(['close', 'saved'])

// Form state
const form = reactive({
  maSach: '',
  tenSach: '',
  nguonGoc_tacGia: '',
  maNXB: '',
  namXuatBan: '',
  soQuyen: 1,
  soQuyenConLai: 1,
  donGia: 0,
  moTa: '',
  hinhAnh: ''
})

const nxbs = ref([])
const loading = ref(false)
const selectedFile = ref(null)
const imagePreview = ref('')
const fileInput = ref(null)

const isEdit = computed(() => !!props.initial?._id)

// Watch props.initial để populate form khi edit
watch(() => props.initial, (newInitial) => {
  if (newInitial) {
    Object.keys(form).forEach(key => {
      if (newInitial[key] !== undefined) {
        form[key] = newInitial[key]
      }
    })
    // Đảm bảo số quyển còn lại không vượt quá số quyển
    if (form.soQuyenConLai > form.soQuyen) {
      form.soQuyenConLai = form.soQuyen
    }
  } else {
    // Reset form khi thêm mới
    resetForm()
  }
}, { immediate: true })

// Load danh sách NXB
async function loadNXBs() {
  try {
    const response = await api.get('/nxb')
    if (response.data.success) {
      nxbs.value = response.data.data
    }
  } catch (error) {
    console.error('Lỗi tải danh sách NXB:', error)
  }
}

// Xử lý file upload
function onFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB')
      clearImage()
      return
    }
    
    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh')
      clearImage()
      return
    }
    
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

// Xóa ảnh
function clearImage() {
  selectedFile.value = null
  imagePreview.value = ''
  form.hinhAnh = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Xử lý lỗi ảnh
function handleImageError(event) {
  event.target.style.display = 'none'
}

// Reset form
function resetForm() {
  Object.keys(form).forEach(key => {
    if (key === 'soQuyen') form[key] = 1
    else if (key === 'soQuyenConLai') form[key] = 1
    else if (key === 'donGia') form[key] = 0
    else form[key] = ''
  })
  clearImage()
}

// Submit form
async function submit() {
  if (!form.maSach || !form.tenSach || !form.soQuyen) {
    alert('Vui lòng điền đầy đủ các trường bắt buộc')
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    
    // Thêm các trường dữ liệu
    Object.keys(form).forEach(key => {
      if (form[key] !== null && form[key] !== undefined) {
        formData.append(key, form[key])
      }
    })
    
    // Thêm file nếu có
    if (selectedFile.value) {
      formData.append('hinhAnhFile', selectedFile.value)
    }

    let response
    if (isEdit.value) {
      response = await api.put(`/sach/${props.initial._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      response = await api.post('/sach', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    if (response.data.success) {
      emit('saved', response.data.data)
    } else {
      throw new Error(response.data.message || 'Có lỗi xảy ra')
    }
  } catch (error) {
    console.error('Lỗi khi lưu sách:', error)
    alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu sách')
  } finally {
    loading.value = false
  }
}

// Cleanup URL khi unmount
onUnmounted(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
})

// Load NXB khi component mounted
onMounted(() => {
  loadNXBs()
})
</script>

<style scoped>
.modal-backdrop { 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.5); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 9999; 
}

.modal-dialog {
  max-width: 800px;
  width: 95%;
  margin: 1rem;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.text-danger {
  color: #dc3545;
}
.modal-dialog {
  margin: auto;
  display: flex;
  align-items: center;
  min-height: calc(100% - 3rem);
}

.modal-content {
  width: 100%;
}
</style>