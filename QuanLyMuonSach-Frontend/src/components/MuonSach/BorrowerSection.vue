<template>
  <div class="mb-3">
    <label class="form-label">Độc giả</label>

    <!-- USER: luôn hiển thị tên user -->
    <div v-if="isUser" class="form-control bg-light">
      {{ userDisplay }}
    </div>

    <!-- ADMIN + SỬA: hiển thị text -->
    <div v-else-if="isAdmin && isEdit" class="form-control bg-light">
      {{ displayInitial }}
    </div>

    <!-- ADMIN + TẠO: chọn qua AsyncSelect -->
    <div v-else>
      <AsyncSelect
        :items="docGias"
        :loading="loading"
        :model-value="model" 
        placeholder="Tìm độc giả..."
        :display-fn="formatDocGia"
        @update:model-value="onModelUpdate" 
        @search="q => $emit('search', q)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import AsyncSelect from "@/components/AsyncSelect.vue";

const props = defineProps({
  role: String,
  isEdit: Boolean,
  initial: Object,
  docGias: Array,
  loading: Boolean,
  userInfo: Object,
});

const emit = defineEmits(["update", "search"]);

const isAdmin = computed(() => props.role === "admin");
const isUser = computed(() => props.role === "user");

const model = ref("");

// SỬA: Hàm xử lý update model
function onModelUpdate(value) {
  model.value = value;
  emit("update", value);
}

// Khi admin sửa → set giá trị
watch(
  () => props.initial,
  (v) => {
    if (props.isEdit && v) {
      model.value = v.maDocGia?._id || v.maDocGia;
      emit("update", model.value); // Đảm bảo emit giá trị ban đầu
    }
  },
  { immediate: true }
);

// format option
function formatDocGia(d) {
  if (!d) return "";
  const name = d.hoLot ? `${d.hoLot} ${d.ten}` : d.ten;
  return `${d.maDocGia || d._id} — ${name}`;
}

// Hiển thị khi sửa
const displayInitial = computed(() => {
  const d = props.initial?.maDocGia;
  if (!d) return "";
  const name = d.hoLot ? `${d.hoLot} ${d.ten}` : d.ten;
  return `${d.maDocGia || d._id} — ${name}`;
});

// Hiển thị thông tin user
const userDisplay = computed(() => {
  if (!props.userInfo) return "";
  return `${props.userInfo.maDocGia} — ${props.userInfo.hoTen}`;
});

// XÓA: watch model cũ
// watch(model, (val) => emit("update", val));
</script>