<template>
  <div class="mb-3">
    <label class="form-label">Sách</label>

    <!-- TRƯỜNG HỢP 1: Khi SỬA phiếu mượn -->
    <div v-if="(isUser || isAdmin) && isEdit" class="form-control bg-light">
      {{ displayInitial }}
    </div>

    <!-- TRƯỜNG HỢP 2: Khi TẠO MỚI từ BookCard (có selectedBook) -->
    <div v-else-if="!isEdit && selectedBook" class="form-control bg-light">
      {{ displaySelectedBook }}
    </div>

    <!-- TRƯỜNG HỢP 3: Khi tạo mới thủ công (không có selectedBook) -->
    <div v-else>
      <AsyncSelect
        :items="saches"
        :loading="loading"
        :model-value="model"
        :initial-display="initialDisplayText"
        placeholder="Tìm sách..."
        :display-fn="formatSach"
        @update:model-value="onModelUpdate"
        @search="q => $emit('search', q)"
        @select="onBookSelect"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import AsyncSelect from "@/components/AsyncSelect.vue";

const props = defineProps({
  role: String,
  isEdit: Boolean,
  initial: Object,
  saches: Array,
  loading: Boolean,
  selectedBook: Object // Sách từ BookCard khi nhấn "Mượn ngay"
});

const emit = defineEmits(["update", "search"]);

const isAdmin = computed(() => props.role === "admin");
const isUser = computed(() => props.role === "user");

// Lưu ID sách
const model = ref("");

// Xử lý khi có selectedBook từ BookCard
watch(
  () => props.selectedBook,
  (book) => {
    console.log("📖 BookSection - selectedBook thay đổi:", book);
    if (book && book._id && !props.isEdit) {
      model.value = book._id;
      emit("update", book._id);
    }
  },
  { immediate: true }
);

// Xử lý khi có initial data (khi sửa)
watch(
  () => props.initial,
  (v) => {
    if (v && v.maSach && props.isEdit) {
      const id = v.maSach._id || v.maSach;
      model.value = id;
      emit("update", model.value);
    }
  },
  { immediate: true }
);

// Hiển thị khi SỬA (dùng initial data)
const displayInitial = computed(() => {
  const maSach = props.initial?.maSach;
  if (!maSach) return "Không có dữ liệu sách";

  if (typeof maSach === "object") {
    return `${maSach.maSach} — ${maSach.tenSach}`;
  }

  const found = props.saches.find(s => s._id === maSach || s.maSach === maSach);
  if (found) return `${found.maSach} — ${found.tenSach}`;

  return `Mã sách: ${maSach}`;
});

// Hiển thị khi TẠO MỚI từ BookCard (dùng selectedBook)
const displaySelectedBook = computed(() => {
  if (!props.selectedBook) return "Không có dữ liệu sách";
  return formatSach(props.selectedBook);
});

// Các hàm khác giữ nguyên
const initialDisplayText = ref("");

function onModelUpdate(value) {
  model.value = value;
  emit("update", value);
}

function onBookSelect(book) {
  if (book) {
    initialDisplayText.value = formatSach(book);
  }
}

function formatSach(s) {
  if (!s) return "";
  return `${s.maSach} — ${s.tenSach}`;
}
</script>