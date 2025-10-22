<template>
  <div class="async-select" ref="root" style="position:relative;">
    <input
      ref="inputRef"
      :placeholder="placeholder"
      class="form-control"
      type="text"
      v-model="query"
      @focus="openDropdown()"
      @keydown.down.prevent="onArrowDown"
      @keydown.up.prevent="onArrowUp"
      @keydown.enter.prevent="onEnter"
      @keydown.esc.prevent="closeDropdown"
      @blur="onBlur"
      autocomplete="off"
    />

    <div v-if="loading" class="small text-muted mt-1">Đang tải...</div>

    <!-- debug optional -->
    <div v-if="showDebug" class="small text-muted mt-1">Items: {{ sourceItems.length }}</div>

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
        <div v-html="displayOf(it)"></div>
      </button>

      <div v-if="!limitedItems.length" class="list-group-item small text-muted">
        Không tìm thấy kết quả
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { unref } from "vue";

const props = defineProps({
  modelValue: [String, Number, null],
  items: { type: [Array, Object], default: () => [] }, // accept array or ref
  loading: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
  displayFn: { type: Function, default: null },
  displayKey: { type: String, default: "" },
  valueKey: { type: String, default: "_id" },
  debounceMs: { type: Number, default: 250 },
  maxShow: { type: Number, default: 50 },
  showDebug: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "select", "search"]);

const query = ref("");
const open = ref(false);
const highlighted = ref(0);
const inputRef = ref(null);
const root = ref(null);
let debounceTimer = null;

const sourceItems = computed(() => {
  try {
    const v = unref(props.items);
    return Array.isArray(v) ? v : [];
  } catch {
    return Array.isArray(props.items) ? props.items : [];
  }
});

watch(query, (q) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit("search", q);
  }, props.debounceMs);
});

const filteredItems = computed(() => {
  const q = (query.value || "").trim().toLowerCase();
  if (!q) return sourceItems.value || [];
  return (sourceItems.value || []).filter((it) => {
    const text = (displayOf(it) || "").toString().toLowerCase();
    return text.includes(q);
  });
});

const limitedItems = computed(() => (filteredItems.value || []).slice(0, props.maxShow));

function displayOf(it) {
  if (!it) return "";
  if (props.displayFn) return props.displayFn(it);
  if (props.displayKey && it[props.displayKey] != null) return String(it[props.displayKey]);
  const name = it.ten || it.tenSach || it.name || (it.hoLot ? `${it.hoLot} ${it.ten || ""}` : "");
  const code = it.maDocGia || it.maSach || it._id || it.id || "";
  return code ? `${code} — ${name}` : name || "";
}

function keyOf(it) {
  if (!it) return null;
  return it[props.valueKey] ?? it.id ?? it._id ?? null;
}

function openDropdown() {
  open.value = true;
  highlighted.value = 0;
}

function closeDropdown() {
  open.value = false;
}

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

function selectItem(it) {
  const v = keyOf(it);
  emit("update:modelValue", v);
  emit("select", it);
  query.value = displayOf(it);
  closeDropdown();
  nextTick(() => {
    if (inputRef.value) inputRef.value.blur();
  });
}

function onBlur() {
  setTimeout(() => closeDropdown(), 120);
}

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
</style>
