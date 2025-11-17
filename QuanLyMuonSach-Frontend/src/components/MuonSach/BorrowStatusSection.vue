<template>
  <div class="mb-3">
    <label class="form-label">Trạng thái</label>

    <!-- USER: chỉ hiển thị text -->
    <div v-if="isUser" class="form-control bg-light">
      CHỜ DUYỆT
    </div>

    <!-- ADMIN: hiển thị dropdown -->
    <select
      v-else
      class="form-select"
      v-model="localValue"
    >
      <option v-for="s in statuses" :key="s" :value="s">
        {{ s }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  role: String,
  modelValue: String,
});

const emit = defineEmits(["update:modelValue"]);

const isAdmin = computed(() => props.role === "admin");
const isUser = computed(() => props.role === "user");

const statuses = [
  "CHỜ DUYỆT",
  "ĐÃ DUYỆT",
  "ĐÃ TRẢ",
  "HẾT HẠN",
];

const localValue = ref(props.modelValue || "CHỜ DUYỆT");

watch(
  () => props.modelValue,
  (v) => (localValue.value = v),
  { immediate: true }
);

watch(localValue, (v) => emit("update:modelValue", v));
</script>
