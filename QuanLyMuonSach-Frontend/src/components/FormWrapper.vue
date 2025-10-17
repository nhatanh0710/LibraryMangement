<template>
  <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh">
    <div class="card shadow p-4" :style="{ width: width }">
      <h5 v-if="title" class="text-center mb-3">{{ title }}</h5>
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  width: { type: String, default: '420px' }
})
</script>

<style scoped>
.card { border-radius: 10px; }
</style>
