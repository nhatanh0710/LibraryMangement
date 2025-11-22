<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title">
          <i class="bi bi-journal-plus me-2"></i>
          {{ isEdit ? 'Sửa phiếu mượn' : 'Thêm phiếu mượn' }}
        </h5>
        <button type="button" class="btn-close btn-close-white" @click="cancel"></button>
      </div>

      <form @submit.prevent="submitForm" class="modal-body">
        <!-- Các component con giữ nguyên -->
        <BorrowerSection
          :role="role"
          :is-edit="isEdit"
          :initial="initial"
          :doc-gias="docGias"
          :loading="docGiasLoading"
          :user-info="userInfo"
          @update="(v) => (form.maDocGia = v)"
        />

        <BookSection
          :role="role"
          :is-edit="isEdit"
          :initial="initial"
          :saches="saches"
          :loading="sachesLoading"
          :selected-book="selectedBook"
          @update="(v) => (form.maSach = v)"
        />

        <BorrowDatesSection
          :role="role"
          :is-edit="isEdit"
          :initial="initial"
          @update="updateDates"
        />

        <BorrowStatusSection
          :role="role"
          v-model="form.trangThai"
        />

        <!-- Hiển thị lỗi -->
        <div v-if="error" class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ error }}
        </div>
      </form>

      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" @click="cancel">
          <i class="bi bi-x-circle me-2"></i>Hủy
        </button>
        <button type="submit" class="btn btn-primary" :disabled="submitting" @click="submitForm">
          <i class="bi" :class="submitting ? 'bi-arrow-repeat spin' : 'bi-check-circle'"></i>
          {{ submitting ? 'Đang xử lý...' : 'Lưu' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Phần script giữ nguyên hoàn toàn
import { reactive, computed, ref, watch } from "vue";
import BorrowerSection from "./BorrowerSection.vue";
import BookSection from "./BookSection.vue";
import BorrowDatesSection from "./BorrowDatesSection.vue";
import BorrowStatusSection from "./BorrowStatusSection.vue";
import * as TheoDoiService from "@/services/muonSachService";

// Nhận dữ liệu từ cha
const props = defineProps({
  role: { type: String, required: true },
  initial: { type: Object, default: null },
  docGias: { type: Array, default: () => [] },
  saches: { type: Array, default: () => [] },
  docGiasLoading: Boolean,
  sachesLoading: Boolean,
  userInfo: Object,
  visible: { type: Boolean, default: false },
  selectedBook: { type: Object, default: null }
});

// Emit về cha
const emit = defineEmits(["saved", "cancel", "update:visible"]);

// Trạng thái phụ
const isEdit = computed(() => !!props.initial);
const error = ref("");
const submitting = ref(false);

// Model của form
const form = reactive({
  maDocGia: "",
  maSach: "",
  ngayMuon: "",
  ngayDuKienTra: "",
  ngayTra: "",
  trangThai: "CHỜ DUYỆT",
});

// Theo dõi visible để reset form khi mở
watch(() => props.visible, v => {
  if (v && !isEdit.value) {
    if (props.selectedBook && props.selectedBook._id) {
      form.maSach = props.selectedBook._id;
    }
    if (props.role === "user" && props.userInfo && props.userInfo._id) {
      form.maDocGia = props.userInfo._id;
    }
    form.ngayMuon = new Date().toISOString().split('T')[0];
  }
});

// Khi sửa → load dữ liệu ban đầu
watch(
  () => props.initial,
  (v) => {
    if (!v) {
      resetForm();
      return;
    }
    form.maDocGia = v.maDocGia?._id || v.maDocGia || "";
    form.maSach = v.maSach?._id || v.maSach || "";
    form.trangThai = v.trangThai || "CHỜ DUYỆT";
    form.ngayMuon = v.ngayMuon || "";
    form.ngayDuKienTra = v.ngayDuKienTra || "";
    form.ngayTra = v.ngayTra || "";
  },
  { immediate: true }
);

// Theo dõi selectedBook để cập nhật form
watch(
  () => props.selectedBook,
  (book) => {
    if (book && book._id && !isEdit.value && props.visible) {
      form.maSach = book._id;
    }
  },
  { immediate: true }
);

// Reset form về trạng thái mặc định
function resetForm() {
  form.maDocGia = "";
  form.maSach = "";
  form.trangThai = "CHỜ DUYỆT";
  form.ngayMuon = "";
  form.ngayDuKienTra = "";
  form.ngayTra = "";
  error.value = "";
}

// Nhận ngày từ BorrowDatesSection
function updateDates(dates) {
  Object.assign(form, dates);
}

// Validate trước khi gửi API
function validate() {
  if (!form.maDocGia) return "Chưa chọn độc giả";
  if (!form.maSach) return "Chưa chọn sách";
  if (!form.ngayDuKienTra) return "Chưa chọn ngày dự kiến trả";
  
  if (form.ngayMuon && form.ngayDuKienTra) {
    const ngayMuon = new Date(form.ngayMuon);
    const ngayDuKienTra = new Date(form.ngayDuKienTra);
    if (ngayDuKienTra <= ngayMuon) {
      return "Ngày dự kiến trả phải sau ngày mượn";
    }
  }
  
  return "";
}

// Gửi dữ liệu lên server
async function submitForm() {
  error.value = validate();
  if (error.value) return;

  submitting.value = true;

  try {
    const payload = {
      maDocGia: form.maDocGia,
      maSach: form.maSach,
      ngayMuon: form.ngayMuon || new Date().toISOString(),
      ngayDuKienTra: form.ngayDuKienTra,
      ngayTra: form.ngayTra,
      trangThai: props.role === "user" ? "CHỜ DUYỆT" : form.trangThai,
    };

    let savedData;

    if (isEdit.value) {
      const res = await TheoDoiService.updateMuonSach(props.initial._id, payload);
      savedData = res.data;
    } else {
      const res = await TheoDoiService.createMuonSach(payload);
      savedData = res.data;
    }

    emit("saved", savedData);
    close();
  } catch (err) {
    console.error("Submit error:", err);
    error.value = err?.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu";
  } finally {
    submitting.value = false;
  }
}

// Hủy form
function cancel() {
  emit("cancel");
  close();
}

// Đóng form + reset dữ liệu
function close() {
  emit("update:visible", false);
  resetForm();
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 600px;
  max-width: 95vw;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  border-bottom: 3px solid var(--accent-300);
  padding: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1.25rem;
}

/* Spin animation cho loading */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    width: auto;
  }
  
  .modal-body {
    padding: 1rem;
  }
}
</style>