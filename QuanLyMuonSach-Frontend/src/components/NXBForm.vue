<template>
  <div class="modal-backdrop">
    <div class="modal d-block" tabindex="-1">
      <div class="modal-dialog">
        <form @submit.prevent="submit">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEdit ? 'Sửa NXB' : 'Thêm NXB' }}</h5>
              <button type="button" class="btn-close" @click="$emit('close')"></button>
            </div>

            <div class="modal-body">
              <!-- input Mã NXB -->
              <div class="mb-2">
                <label class="form-label">Mã NXB</label>
                <input v-model="form.maNXB" class="form-control" required />
              </div>

              <!-- input Tên NXB -->
              <div class="mb-2">
                <label class="form-label">Tên NXB</label>
                <input v-model="form.tenNXB" class="form-control" required />
              </div>

              <!-- input Địa chỉ -->
              <div class="mb-2">
                <label class="form-label">Địa chỉ</label>
                <input v-model="form.diaChi" class="form-control" />
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
import { reactive, computed, watch } from 'vue'
import { createNXB, updateNXB } from '@/services/nxbService'

const props = defineProps({ initial: { type: Object, default: null } })
const emit = defineEmits(['close', 'saved'])

// state form
const form = reactive({ maNXB: '', tenNXB: '', diaChi: '' })
const isEdit = computed(() => !!props.initial && !!props.initial._id)

// helper clone để tránh mutate trực tiếp props
const safeClone = (obj) => { if (!obj) return null; try { return JSON.parse(JSON.stringify(obj)) } catch(e) { return {...obj} } }

// watch props.initial để populate form khi modal mở lại
watch(() => props.initial, (val) => {
  if (!val) Object.assign(form, { maNXB:'', tenNXB:'', diaChi:'' });
  else Object.assign(form, safeClone(val) || {});
}, { immediate: true })

// submit create/update
async function submit() {
  try {
    const payload = { ...form };
    const nxbObj = isEdit.value ? await updateNXB(props.initial._id, payload) : await createNXB(payload);
    emit('saved', nxbObj);
  } catch(err) {
    console.error(err);
    alert(err?.response?.data?.message || 'Lỗi khi lưu NXB');
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:9999;
}
</style>

<!--
Ghi chú:
- Modal thêm/sửa Nhà xuất bản (NXB)
- Props initial để xác định edit hay thêm mới
- Form reactive, watch để populate dữ liệu
- Submit gọi service create hoặc update, emit saved
-->