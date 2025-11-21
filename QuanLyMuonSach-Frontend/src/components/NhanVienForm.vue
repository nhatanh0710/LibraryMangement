<template>
  <div class="modal-backdrop">
    <div class="modal d-block" tabindex="-1">
      <div class="modal-dialog">
        <!-- form tắt autocomplete, dùng key để reset form -->
        <form @submit.prevent="submit" autocomplete="off" :key="modalKey">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEdit ? 'Sửa nhân viên' : 'Thêm nhân viên' }}</h5>
              <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
            </div>

            <div class="modal-body">
              <!-- các input row grid -->
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Mã nhân viên</label>
                  <input v-model="form.msnv" type="text" class="form-control" :readonly="isEdit" required autocomplete="off" />
                </div>

                <div class="col-12">
                  <label class="form-label">Họ và tên</label>
                  <input v-model="form.hoTenNV" type="text" class="form-control" required autocomplete="name" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Chức vụ</label>
                  <select v-model="form.chucVu" class="form-select" required>
                    <option value="">-- Chọn --</option>
                    <option v-for="opt in chucVuOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Trạng thái</label>
                  <select v-model="form.trangThai" class="form-select" required>
                    <option value="">-- Chọn --</option>
                    <option v-for="opt in trangThaiOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label">Địa chỉ</label>
                  <input v-model="form.diaChi" type="text" class="form-control" autocomplete="street-address" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Số điện thoại</label>
                  <input v-model="form.soDienThoai" type="tel" class="form-control" autocomplete="tel" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Mật khẩu</label>
                  <input v-model="form.password" type="password" class="form-control" :placeholder="isEdit ? 'Để trống nếu không đổi mật khẩu' : ''" :required="!isEdit" :autocomplete="isEdit ? 'current-password' : 'new-password'" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">Đóng</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ loading ? 'Đang lưu...' : 'Lưu' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import * as nhanVienService from "@/services/nhanVienService";

const props = defineProps({
  initial: { type: Object, default: null },
  modalId: { type: [String, Number], default: () => Date.now() },
});
const emit = defineEmits(["close", "saved"]);

// options cho select
const chucVuOptions = ["NHÂN VIÊN", "GIÁM ĐỐC"];
const trangThaiOptions = ["ACTIVE", "BLOCKED"];

// state form
const form = ref({ msnv:"", hoTenNV:"", password:"", chucVu:"NHÂN VIÊN", diaChi:"", soDienThoai:"", trangThai:"ACTIVE" });
const loading = ref(false);
const modalKey = computed(() => `modal-${props.modalId}-${!!props.initial}`);
const isEdit = computed(() => !!props.initial?._id);

// watch initial để populate form
watch(() => props.initial, (val) => {
  if (val) {
    form.value = {
      msnv: val.msnv ?? "",
      hoTenNV: val.hoTenNV ?? val.hoTen ?? "",
      password: "",
      chucVu: val.chucVu ?? "NHÂN VIÊN",
      diaChi: val.diaChi ?? "",
      soDienThoai: val.soDienThoai ?? val.sdt ?? "",
      trangThai: val.trangThai ?? "ACTIVE",
    };
  } else {
    form.value = { msnv:"", hoTenNV:"", password:"", chucVu:"NHÂN VIÊN", diaChi:"", soDienThoai:"", trangThai:"ACTIVE" };
  }
}, { immediate: true });

// submit form create/update
async function submit() {
  try {
    loading.value = true;
    const payload = { msnv: form.value.msnv, hoTenNV: form.value.hoTenNV, chucVu: form.value.chucVu, diaChi: form.value.diaChi, soDienThoai: form.value.soDienThoai, trangThai: form.value.trangThai };
    if (form.value.password && form.value.password.trim() !== "") payload.password = form.value.password;
    let saved;
    if (isEdit.value) saved = await nhanVienService.updateNhanVien(props.initial._id, payload);
    else saved = await nhanVienService.createNhanVien(payload);
    emit("saved", saved);
  } catch (err) {
    console.error("Save nhân viên error:", err);
    alert(err?.response?.data?.message || "Lỗi khi lưu nhân viên");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index:1050; }
.modal-dialog { max-width: 720px; }
</style>

<!--
Ghi chú:
- Modal thêm/sửa nhân viên.
- Props initial để edit, modalId để reset form khi parent mở modal mới.
- Form có validation cơ bản, autocomplete được set hợp lý.
- Submit: gọi service create hoặc update, emit saved.
- Spinner hiển thị khi loading.
-->
