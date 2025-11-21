<template>
  <div class="mb-3">
    <label class="form-label">Độc giả</label>

    <!-- User: luôn hiển thị thông tin chính mình, không được chọn -->
    <div v-if="isUser" class="form-control bg-light">
      {{ userDisplay }}
    </div>

    <!-- Admin khi sửa: chỉ xem lại độc giả đã chọn -->
    <div v-else-if="isAdmin && isEdit" class="form-control bg-light">
      {{ displayInitial }}
    </div>

    <!-- Admin khi tạo mới: được chọn độc giả -->
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
  role: String,         // admin hoặc user
  isEdit: Boolean,      // đang sửa hay đang tạo mới
  initial: Object,      // dữ liệu ban đầu khi sửa
  docGias: Array,       // danh sách độc giả để chọn
  loading: Boolean,
  userInfo: Object,     // thông tin user đang đăng nhập
});



const emit = defineEmits(["update", "search"]);

const isAdmin = computed(() => props.role === "admin");
const isUser  = computed(() => props.role === "user");

// Lưu _id độc giả đang chọn
const model = ref("");

// Khi admin chọn hoặc thay đổi độc giả
function onModelUpdate(value) {
  model.value = value;
  emit("update", value);
}

// Khi là user → tự động điền độc giả là chính mình
watch(
  () => props.userInfo,
  (v) => {
    if (props.role === "user" && v) {
      emit("update", v._id || v.maDocGia);
    }
  },
  { immediate: true }
);

// Khi vào trang sửa → tự điền độc giả ban đầu
watch(
  () => props.initial,
  (v) => {
    if (props.isEdit && v) {
      model.value = v.maDocGia?._id || v.maDocGia;
      emit("update", model.value);
    }
  },
  { immediate: true }
);

// Cách hiển thị mỗi độc giả trong danh sách
function formatDocGia(d) {
  if (!d) return "";
  const name = d.hoLot ? `${d.hoLot} ${d.ten}` : d.ten;
  return `${d.maDocGia || d._id} — ${name}`;
}

// Hiển thị readonly khi admin sửa
const displayInitial = computed(() => {
  const d = props.initial?.maDocGia;
  if (!d) return "";
  const name = d.hoLot ? `${d.hoLot} ${d.ten}` : d.ten;
  return `${d.maDocGia || d._id} — ${name}`;
});

// Hiển thị thông tin user (luôn dùng khi role = user)
const userDisplay = computed(() => {
  if (!props.userInfo) return "";
  return `${props.userInfo.maDocGia} — ${props.userInfo.hoLot} ${props.userInfo.ten}`;
});


</script>
