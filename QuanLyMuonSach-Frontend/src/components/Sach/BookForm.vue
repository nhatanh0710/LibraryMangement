<template>
  <!-- Modal Thêm/Sửa sách -->
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
              <!-- Inputs: mã sách, tên, năm, số quyển, tác giả, NXB, giá, mô tả, hình ảnh -->
              <!-- file upload + preview -->
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
// form reactive, safeClone, preview image, selectedFile, reset form
// watch props.initial để populate form
// onFileChange, clearImage, imgError
// submit FormData -> createBook/updateBook
// load danh sách NXB onMounted
// revoke ObjectURLs onUnmounted
</script>

<style scoped>
.modal-backdrop { position: fixed; inset:0; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:9999; }
</style>

<!--
Ghi chú:
- Modal Thêm/Sửa sách với tất cả trường thông tin và hình ảnh.
- Props initial để edit, reactive form để giữ state.
- File upload preview và FormData gửi lên backend.
- NXB select load từ API.
- Cleanup ObjectURL khi unmount hoặc thay đổi file.
-->
