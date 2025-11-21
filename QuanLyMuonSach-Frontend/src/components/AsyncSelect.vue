<template>
  <div class="async-select" ref="root" style="position:relative;">
    <!-- input chính -->
    <input
      ref="inputRef"
      :placeholder="placeholder"
      class="form-control"
      type="text"
      v-model="displayText"
      @focus="openDropdown()"
      @keydown.down.prevent="onArrowDown"
      @keydown.up.prevent="onArrowUp"
      @keydown.enter.prevent="onEnter"
      @keydown.esc.prevent="closeDropdown"
      @blur="onBlur"
      @input="onInputChange"
      autocomplete="off"
    />

    <!-- hiển thị loading -->
    <div v-if="loading" class="small text-muted mt-1">Đang tải...</div>

    <!-- debug tùy chọn -->
    <div v-if="showDebug" class="small text-muted mt-1">Items: {{ sourceItems.length }}</div>

    <!-- dropdown item -->
    <div
      v-if="open && (limitedItems.length || (query && !loading))"
      class="list-group position-absolute w-100 shadow-sm mt-1"
      style="z-index:2000; max-height:260px; overflow:auto;"
    >
      <button
        v-for="(it, idx) in limitedItems"
        :key="keyOf(it) || idx"
        type="button"
        class="list-group-item list-group-item-action"
        :class="{ active: idx === highlighted }"
        @mousedown.prevent="selectItem(it)"
      >
        <div v-html="highlightMatch(displayOf(it))"></div>
      </button>

      <!-- thông báo không tìm thấy kết quả -->
      <div v-if="!limitedItems.length" class="list-group-item small text-muted">
        Không tìm thấy kết quả
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { unref } from "vue";

// props định nghĩa component
const props = defineProps({
  modelValue: [String, Number, null],
  items: { type: [Array, Object], default: () => [] },
  loading: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
  displayFn: { type: Function, default: null },
  displayKey: { type: String, default: "" },
  valueKey: { type: String, default: "_id" },
  debounceMs: { type: Number, default: 250 },
  maxShow: { type: Number, default: 50 },
  showDebug: { type: Boolean, default: false },
  initialDisplay: { type: String, default: "" } // Thêm prop để hiển thị sẵn text
});

const emit = defineEmits(["update:modelValue", "select", "search"]);

// state chính
const query = ref("");
const displayText = ref(props.initialDisplay || ""); // Text hiển thị
const open = ref(false);
const highlighted = ref(0);
const inputRef = ref(null);
const root = ref(null);
let debounceTimer = null;

// lấy danh sách items thực tế từ props
const sourceItems = computed(() => {
  try {
    const v = unref(props.items);
    return Array.isArray(v) ? v : [];
  } catch {
    return Array.isArray(props.items) ? props.items : [];
  }
});

// Theo dõi thay đổi initialDisplay
watch(() => props.initialDisplay, (newVal) => {
  if (newVal && !displayText.value) {
    displayText.value = newVal;
  }
}, { immediate: true });

// debounce khi search
watch(query, (q) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit("search", q);
  }, props.debounceMs);
});

// Xử lý khi người dùng nhập
function onInputChange(event) {
  const value = event.target.value;
  displayText.value = value;
  query.value = value;
  
  // Nếu input rỗng, clear selection
  if (!value.trim()) {
    emit("update:modelValue", null);
    emit("select", null);
  }
}

// lọc item theo query
const filteredItems = computed(() => {
  const q = (query.value || "").trim().toLowerCase();
  if (!q) return sourceItems.value || [];
  return (sourceItems.value || []).filter((it) => {
    const text = (displayOf(it) || "").toString().toLowerCase();
    return text.includes(q);
  });
});

// giới hạn số item hiển thị
const limitedItems = computed(() => (filteredItems.value || []).slice(0, props.maxShow));

// lấy text hiển thị cho item
function displayOf(it) {
  if (!it) return "";
  if (props.displayFn) return props.displayFn(it);
  if (props.displayKey && it[props.displayKey] != null) return String(it[props.displayKey]);
  const name = it.ten || it.tenSach || it.name || (it.hoLot ? `${it.hoLot} ${it.ten || ""}` : "");
  const code = it.maDocGia || it.maSach || it._id || it.id || "";
  return code ? `${code} — ${name}` : name || "";
}

// Highlight kết quả tìm kiếm
function highlightMatch(text) {
  const q = query.value.trim();
  if (!q) return text;
  
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// lấy key value của item
function keyOf(it) {
  if (!it) return null;
  return it[props.valueKey] ?? it.id ?? it._id ?? null;
}

// mở dropdown
function openDropdown() {
  open.value = true;
  highlighted.value = 0;
}

// đóng dropdown
function closeDropdown() {
  open.value = false;
}

// navigation keyboard
function onArrowDown() {
  if (!limitedItems.value.length) return;
  highlighted.value = (highlighted.value + 1) % limitedItems.value.length;
}
function onArrowUp() {
  if (!limitedItems.value.length) return;
  highlighted.value = (highlighted.value - 1 + limitedItems.value.length) % limitedItems.value.length;
}
function onEnter() {
  const it = limitedItems.value[highlighted.value];
  if (it) selectItem(it);
}

// chọn item
function selectItem(it) {
  const v = keyOf(it);
  emit("update:modelValue", v);
  emit("select", it);
  displayText.value = displayOf(it); // Cập nhật text hiển thị
  closeDropdown();
  nextTick(() => {
    if (inputRef.value) inputRef.value.blur();
  });
}

// blur xử lý đóng dropdown
function onBlur() {
  setTimeout(() => closeDropdown(), 120);
}

// click ngoài để đóng dropdown
function onDocClick(e) {
  if (!root.value) return;
  if (!root.value.contains(e.target)) closeDropdown();
}
onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>

<style scoped>
.list-group-item.active {
  background-color: #0d6efd;
  color: white;
}

/* Style cho highlight */
:deep(mark) {
  background-color: #ffeb3b;
  padding: 0;
}
</style>