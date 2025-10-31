<template>
  <div class="modal-backdrop">
    <div class="modal d-block" tabindex="-1">
      <div class="modal-dialog">
        <form @submit.prevent="submit">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEdit ? 'Sửa độc giả' : 'Thêm độc giả' }}
              </h5>
              <button type="button" class="btn-close" @click="$emit('close')"></button>
            </div>

            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Mã độc giả</label>
                <input v-model="form.maDocGia" type="text" class="form-control" required />
              </div>

             <div class="row g-2">
              <div class="col-6">
                <label class="form-label small">Họ Lót</label>
                <input v-model="form.hoLot" class="form-control form-control-sm" required />
              </div>

              <div class="col-6">
                <label class="form-label small">Tên</label>
                <input v-model="form.ten" class="form-control form-control-sm" required />
              </div>
            </div>

              <div class="mb-3">
                <label class="form-label">Ngày sinh</label>
                <input v-model="form.ngaySinh" type="date" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Giới tính</label>
                <input v-model="form.phai" type="text" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input v-model="form.diaChi" type="text" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input v-model="form.dienThoai" type="text" class="form-control" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">Đóng</button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
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
import * as docGiaService from "@/services/docGiaService";

const props = defineProps({
  initial: { type: Object, default: null },
});
const emit = defineEmits(["close", "saved"]);

const form = ref({
  maDocGia: "",
  hoLot: "",
  ten: "",
  ngaySinh: "",
  diaChi: "",
  phai: "",
  dienThoai: "",
});
const loading = ref(false);
const isEdit = computed(() => !!props.initial?._id);

watch(
  () => props.initial,
  (val) => {
    if (val) form.value = { ...val };
    else
      form.value = {
        maDocGia: "",
        hoLot: "",
        ten: "",
        ngaySinh: "",
        diaChi: "",
        phai: "",
        dienThoai: "",
      };
  },
  { immediate: true }
);

async function submit() {
  try {
    loading.value = true;
    let saved;
    if (isEdit.value)
      saved = await docGiaService.updateDocGia(props.initial._id, form.value);
    else saved = await docGiaService.createDocGia(form.value);

    emit("saved", saved);
  } catch (err) {
    console.error("Save độc giả error:", err);
    alert(err?.response?.data?.message || "Lỗi khi lưu độc giả");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
</style>
