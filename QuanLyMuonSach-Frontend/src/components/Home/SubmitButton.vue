<template>
  <button
    :type="type"
    class="btn w-100"
    :class="variantClass"
    :disabled="disabled"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'   // <-- bắt buộc

// ✅ Định nghĩa props để tái sử dụng
const props = defineProps({
  label: { type: String, default: 'Lưu' },
  variant: { type: String, default: 'primary' }, // primary / success / danger
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false }
})

// ✅ Tính lớp CSS dựa trên variant
const variantClass = computed(() => {
  if (props.variant === 'primary') return 'btn-primary'
  if (props.variant === 'success') return 'btn-success'
  if (props.variant === 'danger') return 'btn-danger'
  return 'btn-secondary'
})
</script>
