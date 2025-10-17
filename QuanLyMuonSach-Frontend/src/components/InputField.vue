<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      class="form-control"
      :placeholder="placeholder"
      v-model="modelValueProxy"
      :disabled="disabled"
      v-bind="attrs"
    />
    <div v-if="error" class="form-text text-danger small">{{ error }}</div>
  </div>
</template>

<script setup>
import { toRefs, computed } from 'vue'
import { useAttrs } from 'vue'
const props = defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  type: { type: String, default: 'text' },
  id: { type: String, default: undefined },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})
</script>

<style scoped>
.form-text.text-danger { margin-top: 0.25rem; }
</style>
