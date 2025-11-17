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
                <input v-model="form.nguonGoc_tacGia" class="form-control" required />
              </div>

            <!--NXB-->
              <div class="mb-2">
                <label class="form-label">Nhà xuất bản</label>
                <select v-model="form.maNXB" class="form-select" required>
                  <option value="" disabled>Chọn NXB</option>
                  <option v-for="nxb in nxbList" :key="nxb._id" :value="nxb._id">
                    {{ nxb.tenNXB }}
                  </option>
                </select>
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
import { ref, reactive, computed, toRaw, watch, onUnmounted, onMounted } from 'vue'
import { createBook, updateBook } from '@/services/bookService'
import api from '@/services/api.js'
// Props / emits
const props = defineProps({
  initial: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

// Helpers
const safeClone = (obj) => {
  if (obj == null) return null

  // primitives
  if (typeof obj !== 'object') return obj

  // Files/Blobs should be returned as-is
  if (obj instanceof File || obj instanceof Blob) return obj

  // try JSON deep clone first (safe for plain data)
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (e) {
    // fallback: try structuredClone if available and object looks safe
    try {
      if (typeof structuredClone === 'function') {
        // avoid cloning DOM nodes or Window by quick check
        const hasBad = Object.values(obj).some(v =>
          typeof v === 'function' ||
          (typeof v === 'object' && v !== null && (v instanceof Window || v instanceof Element))
        )
        if (!hasBad) return structuredClone(obj)
      }
    } catch (err) {
      // ignore
    }
    // last resort: shallow copy
    try {
      return { ...obj }
    } catch {
      return null
    }
  }
}

// Reactive form (local copy)
const form = reactive({
  maSach: '',
  tenSach: '',
  donGia: 0,
  soQuyen: 1,
  namXuatBan: null,
  maNXB: null,
  nguonGoc_tacGia: '',
  soQuyenConLai: 1,
  moTa: '',
  hinhAnh: ''
})

const isEdit = computed(() => !!props.initial && !!props.initial._id)
const nxbList = ref([])
// preview + file
const preview = ref(null)
const selectedFile = ref(null)
let currentObjectUrl = null

function resetFormToDefaults() {
  Object.assign(form, {
    maSach: '',
    tenSach: '',
    donGia: 0,
    soQuyen: 1,
    namXuatBan: null,
    maNXB: null,
    nguonGoc_tacGia: '',
    soQuyenConLai: 1,
    moTa: '',
    hinhAnh: ''
  })
  if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null }
  selectedFile.value = null
  preview.value = null
}

// watch props.initial so form updates whenever parent passes a different object
watch(
  () => props.initial,
  (val) => {
    // cleanup previous objectURL if any
    if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null }

    if (!val) {
      resetFormToDefaults()
      return
    }

    // avoid cloning non-plain data coming from parent
    const copy = safeClone(val) || {}
    if (copy.maNXB && typeof copy.maNXB === 'object') {
      copy.maNXB = copy.maNXB._id || copy.maNXB
    }

    Object.assign(form, { ...form, ...copy })

    if (copy.hinhAnh) {
      preview.value = typeof copy.hinhAnh === 'string' && copy.hinhAnh.startsWith('http')
        ? copy.hinhAnh
        : `${(import.meta.env.VITE_API_BASEURL || 'http://localhost:5000').replace(/\/api$/, '')}/${String(copy.hinhAnh).replace(/^\/+/, '')}`
      form.hinhAnh = copy.hinhAnh
    } else {
      preview.value = null
      form.hinhAnh = ''
    }

    selectedFile.value = null
  },
  { immediate: true }
)


// file handling
function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
  selectedFile.value = file
  currentObjectUrl = URL.createObjectURL(file)
  preview.value = currentObjectUrl
  form.hinhAnh = '' // indicate that backend should accept file
}

function clearImage() {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
  currentObjectUrl = null
  selectedFile.value = null
  preview.value = null
  form.hinhAnh = ''
}

// submit
async function submit() {
  try {
    const fd = new FormData()
    const payload = toRaw(form)

    for (const key of Object.keys(payload)) {
      const val = payload[key]
      if (val === undefined || val === null) continue

      if (val instanceof File || val instanceof Blob) {
        fd.append(key, val)
      } else {
        // append primitives and id strings — do NOT JSON.stringify whole objects
        fd.append(key, String(val))
      }
    }

    if (selectedFile.value) fd.append('file', selectedFile.value)

    const bookObj = isEdit.value
      ? await updateBook(props.initial._id, fd)
      : await createBook(fd)

    if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null }
    selectedFile.value = null

    emit('saved', bookObj)
  } catch (err) {
    console.error(err)
    alert(err?.response?.data?.message || 'Lỗi khi lưu sách')
  }
}


function imgError(e) {
  e.target.src = 'https://via.placeholder.com/120x160?text=No+Image'
}

onUnmounted(() => {
  if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null }
})
onMounted(async () => {
  try {
    const res = await api.get('/nxb') // GET tất cả NXB
    nxbList.value = res.data.data || []
  } catch (err) {
    console.error('Lỗi load NXB:', err)
    nxbList.value = []
  }
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
