<template>
  <!-- Layout wrapper form căn giữa màn hình -->
  <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh">
    <div class="card shadow p-4" :style="{ width: width }">
      <!-- tiêu đề nếu có -->
      <h5 v-if="title" class="text-center mb-3">{{ title }}</h5>
      <!-- slot chứa nội dung form -->
      <slot />
    </div>
  </div>
</template>

<script setup>
// props title và width
const props = defineProps({
  title: { type: String, default: '' },
  width: { type: String, default: '420px' }
})
</script>

<style scoped>
.card { border-radius: 10px; }
</style>

<!--
Ghi chú:
- Component wrapper để căn form hoặc card giữa màn hình.
- Nhận props title và width tuỳ chỉnh.
- Slot dùng để nhúng form hoặc nội dung bất kỳ.
- CSS: border-radius 10px, shadow, padding.
-->