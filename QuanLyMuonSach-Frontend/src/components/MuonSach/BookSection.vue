<template>
  <div class="mb-3">
    <label class="form-label">Sách</label>

    <!-- USER: sửa → hiển thị text -->
    <div v-if="isUser && isEdit" class="form-control bg-light">
      {{ displayInitial }}
    </div>

    <!-- ADMIN: sửa → hiển thị text -->
    <div v-else-if="isAdmin && isEdit" class="form-control bg-light">
      {{ displayInitial }}
    </div>

    <!-- USER tạo hoặc ADMIN tạo -->
    <div v-else>
      <AsyncSelect
        :items="saches"
        :loading="loading"
        :model-value="model" 
        placeholder="Tìm sách..."
        :display-fn="formatSach"
        @update:model-value="onModelUpdate" 
        @search="q => $emit('search', q)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import AsyncSelect from "@/components/AsyncSelect.vue";

const props = defineProps({
  role: String,
  isEdit: Boolean,
  initial: Object,
  saches: Array,
  loading: Boolean,
});

const emit = defineEmits(["update", "search"]);

const isAdmin = computed(() => props.role === "admin");
const isUser = computed(() => props.role === "user");

const model = ref("");

// Hàm xử lý update model
function onModelUpdate(value) {
  model.value = value;
  emit("update", value);
}

// Khi edit → set sẵn value
watch(
  () => props.initial,
  (v) => {
    console.log('📚 BookSection - initial changed:', v);
    if (props.isEdit && v) {
      // Dùng _id để gửi lên backend
      model.value = v.maSach?._id || v.maSach;
      emit("update", model.value);
    }
  },
  { immediate: true }
);

function formatSach(s) {
  if (!s) return "";
  // Hiển thị mã sách nhưng lưu _id
  return `${s.maSach} — ${s.tenSach}`;
}

const displayInitial = computed(() => {
  const maSach = props.initial?.maSach;
  console.log('📚 BookSection - displayInitial input:', maSach);
  
  if (!maSach) return "Không có dữ liệu sách";
  
  // Nếu maSach là object (đã populate)
  if (typeof maSach === 'object') {
    return `${maSach.maSach} — ${maSach.tenSach}`;
  }
  
  // Nếu maSach là string ID, tìm trong danh sách saches
  const foundSach = props.saches.find(s => s._id === maSach);
  if (foundSach) {
    return `${foundSach.maSach} — ${foundSach.tenSach}`;
  }
  
  return `Mã sách: ${maSach}`;
});
</script>