<template>
  <div v-if="visible" class="form-overlay">
    <div class="form-container">
      <form @submit.prevent="submitForm">
        
        <!-- Tiêu đề: tạo mới hoặc chỉnh sửa -->
        <h5 class="mb-3">{{ isEdit ? 'Sửa phiếu mượn' : 'Thêm phiếu mượn' }}</h5>

        <!-- Chọn / hiển thị độc giả -->
        <BorrowerSection
          :role="role"
          :is-edit="isEdit"
          :initial="initial"
          :doc-gias="docGias"
          :loading="docGiasLoading"
          :user-info="userInfo"
          @update="(v) => (form.maDocGia = v)"
        />

        <!-- Chọn / hiển thị sách -->
        <BookSection
          :role="role"
          :is-edit="isEdit"
          :initial="initial"
          :saches="saches"
          :loading="sachesLoading"
          :selected-book="selectedBook"
          @update="(v) => (form.maSach = v)"
        />

        <!-- Nhập ngày mượn / trả -->
        <BorrowDatesSection
          :role="role"
          :is-edit="isEdit"
          :initial="initial"
          @update="updateDates"
        />

        <!-- Trạng thái phiếu (user readonly) -->
        <BorrowStatusSection
          :role="role"
          v-model="form.trangThai"
        />

        <!-- Hiển thị lỗi -->
        <div v-if="error" class="alert alert-danger py-1">{{ error }}</div>

        <!-- Nút lưu / hủy -->
        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="btn btn-secondary me-2" @click="cancel">Hủy</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Đang xử lý...' : 'Lưu' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, watch } from "vue";
import BorrowerSection from "./BorrowerSection.vue";
import BookSection from "./BookSection.vue";
import BorrowDatesSection from "./BorrowDatesSection.vue";
import BorrowStatusSection from "./BorrowStatusSection.vue";
import * as TheoDoiService from "@/services/muonSachService";

// Nhận dữ liệu từ cha
const props = defineProps({
  role: { type: String, required: true },     // admin / user
  initial: { type: Object, default: null },   // dữ liệu khi sửa
  docGias: { type: Array, default: () => [] },
  saches: { type: Array, default: () => [] },
  docGiasLoading: Boolean,
  sachesLoading: Boolean,
  userInfo: Object,
  visible: { type: Boolean, default: false },
  selectedBook: { type: Object, default: null } // Thêm prop nhận sách đã chọn từ BookCard
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
    // Khi mở form tạo mới, tự động set sách nếu có selectedBook
    if (props.selectedBook && props.selectedBook._id) {
      form.maSach = props.selectedBook._id;
    }
    
    // Tự động set độc giả nếu là user
    if (props.role === "user" && props.userInfo && props.userInfo._id) {
      form.maDocGia = props.userInfo._id;
    }
    
    // Tự động set ngày mượn là hôm nay
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
  
  // Validate ngày dự kiến trả phải sau ngày mượn
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

    // Nếu đang sửa → gọi update
    if (isEdit.value) {
      const res = await TheoDoiService.updateMuonSach(props.initial._id, payload);
      savedData = res.data;
    } 
    // Nếu tạo mới → gọi create
    else {
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
.form-overlay {
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

.form-container {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
</style>