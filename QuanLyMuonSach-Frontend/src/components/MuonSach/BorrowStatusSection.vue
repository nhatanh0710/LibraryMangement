<template>
  <div class="mb-3">
    <label class="form-label">Trạng thái</label>

    <!-- User: luôn hiển thị trạng thái cố định (không được chỉnh) -->
    <div v-if="isUser" class="form-control bg-light">
      CHỜ DUYỆT
    </div>

    <!-- Admin: được thay đổi trạng thái -->
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
  role: String,           // admin hoặc user
  modelValue: String,     // giá trị trạng thái từ cha
});

const emit = defineEmits(["update:modelValue"]);

const isAdmin = computed(() => props.role === "admin");
const isUser  = computed(() => props.role === "user");

// Danh sách trạng thái cho admin
const statuses = [
  "CHỜ DUYỆT",
  "ĐÃ DUYỆT",
  "ĐÃ TRẢ",
  "HẾT HẠN",
];

// Local state để bind vào select
const localValue = ref(props.modelValue || "CHỜ DUYỆT");

// Khi cha truyền giá trị mới → cập nhật local
watch(
  () => props.modelValue,
  (v) => (localValue.value = v),
  { immediate: true }
);

// Emit lên cha khi admin thay đổi dropdown
watch(localValue, (v) => emit("update:modelValue", v));
</script>
