<!-- BorrowDatesSection.vue -->
<template>
  <div class="dates-section mb-4">
    <h6 class="section-title">
      <i class="bi bi-calendar-date me-2"></i>
      Thông tin ngày tháng
    </h6>
    
    <div class="row g-3">
      <!-- Ngày mượn - Cho tất cả chỉnh sửa -->
      <div class="col-md-6">
        <label class="form-label">Ngày mượn</label>
        <input
          type="date"
          class="form-control"
          :value="model.ngayMuon"
          @input="handleNgayMuonChange($event.target.value)"
          required
        />
      </div>
      
      <!-- Ngày dự kiến trả - Tính tự động -->
      <div class="col-md-6">
        <label class="form-label">Ngày dự kiến trả</label>
        <div class="input-group">
          <input
            type="date"
            class="form-control"
            :value="model.ngayDuKienTra"
            readonly
            style="background-color: #f8f9fa;"
          />
    
        </div>
        <small class="text-muted d-block mt-1">
          Được tính tự động dựa trên ngày mượn (14 ngày theo quy định)
        </small>
      </div>
      
      <!-- Ngày trả thực tế - Chỉ hiển thị cho admin/nhân viên -->
      <div class="col-md-6" v-if="showReturnDate">
        <label class="form-label">Ngày trả (thực tế)</label>
        <input
          type="date"
          class="form-control"
          :value="model.ngayTra"
          @input="$emit('update:ngayTra', $event.target.value)"
        />
        <small class="text-muted">Chỉ điền khi sách đã được trả</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'

const props = defineProps({
  role: { type: String, default: 'user' },
  isEdit: { type: Boolean, default: false },
  initial: { type: Object, default: null },
  showReturnDate: { type: Boolean, default: true }
})

const emit = defineEmits(['update:ngayMuon', 'update:ngayDuKienTra', 'update:ngayTra', 'update'])

const model = reactive({
  ngayMuon: '',
  ngayDuKienTra: '',
  ngayTra: ''
})

// Hàm tính ngày dự kiến trả = ngày mượn + 14 ngày
function calculateDueDate(ngayMuon) {
  if (!ngayMuon) return '';
  
  const date = new Date(ngayMuon);
  date.setDate(date.getDate() + 14);
  
  // Format lại thành YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Xử lý khi ngày mượn thay đổi
function handleNgayMuonChange(value) {
  model.ngayMuon = value;
  model.ngayDuKienTra = calculateDueDate(value);
  
  // Emit cả hai giá trị lên parent
  emit('update:ngayMuon', value);
  emit('update:ngayDuKienTra', model.ngayDuKienTra);
  emit('update', { ...model });
}

// Theo dõi initial để cập nhật model
watch(() => props.initial, (v) => {
  if (v) {
    model.ngayMuon = v.ngayMuon ? new Date(v.ngayMuon).toISOString().split('T')[0] : '';
    model.ngayDuKienTra = v.ngayDuKienTra ? new Date(v.ngayDuKienTra).toISOString().split('T')[0] : '';
    model.ngayTra = v.ngayTra ? new Date(v.ngayTra).toISOString().split('T')[0] : '';
    
    // Nếu chưa có ngày dự kiến trả và có ngày mượn, tính tự động
    if (!model.ngayDuKienTra && model.ngayMuon) {
      model.ngayDuKienTra = calculateDueDate(model.ngayMuon);
    }
  }
}, { immediate: true })

// Theo dõi các thay đổi trong model để emit lên cha
watch(model, (newVal) => {
  emit('update', newVal)
}, { deep: true })
</script>

<style scoped>
.section-title {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-light);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

/* Định dạng cho input chỉ đọc */
.readonly-input {
  background-color: #f8f9fa !important;
  cursor: not-allowed;
}
</style>