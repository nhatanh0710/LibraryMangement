<!-- src/components/common/Pagination.vue -->
<template>
  <nav v-if="totalPages > 1" class="mt-3">
    <ul class="pagination justify-content-center mb-0">
      <!-- First -->
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button class="page-link" @click="goTo(1)" :disabled="currentPage === 1">«</button>
      </li>

      <!-- Prev -->
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button class="page-link" @click="goTo(currentPage - 1)" :disabled="currentPage === 1">‹</button>
      </li>

      <!-- Numbered pages -->
      <li v-for="p in pagesToShow" :key="p" class="page-item" :class="{ active: p === currentPage }">
        <button class="page-link" @click="goTo(p)">{{ p }}</button>
      </li>

      <!-- Next -->
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button class="page-link" @click="goTo(currentPage + 1)" :disabled="currentPage === totalPages">›</button>
      </li>

      <!-- Last -->
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button class="page-link" @click="goTo(totalPages)" :disabled="currentPage === totalPages">»</button>
      </li>

      <!-- Page size selector -->
      <li class="page-item ms-2">
        <select class="form-select form-select-sm" v-model.number="pageSize" @change="emitLimit">
          <option v-for="opt in [5, 10, 20, 50]" :key="opt" :value="opt">{{ opt }}/trang</option>
        </select>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed, ref, toRefs, watch } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  limit: { type: Number, default: 10 },
  maxButtons: { type: Number, default: 5 }
})

// gọi sự kiện khi trang hoặc giới hạn thay đổi
const emit = defineEmits(['update:page', 'update:limit', 'change'])

// ✅ Các tham số phản ứng
const { page: pageProp, totalPages: totalPagesProp, limit: limitProp } = toRefs(props)

const currentPage = computed(() => Math.max(1, Math.min(pageProp.value, totalPagesProp.value)))
const totalPages = computed(() => Math.max(1, totalPagesProp.value))
const pageSize = ref(limitProp.value)

// Đồng bộ pageSize khi prop limit thay đổi
watch(limitProp, val => (pageSize.value = val))

// ✅ Tính danh sách trang hiển thị (căn giữa)
const pagesToShow = computed(() => {
  const max = Math.max(3, props.maxButtons)
  let start = Math.max(1, currentPage.value - Math.floor(max / 2))
  let end = start + max - 1
  if (end > totalPages.value) {
    end = totalPages.value
    start = Math.max(1, end - max + 1)
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function goTo(p) {
  if (p < 1) p = 1
  if (p > totalPages.value) p = totalPages.value
  if (p !== currentPage.value) emit('update:page', p)
}

function emitLimit() {
  emit('update:limit', pageSize.value)
  emit('change', { page: currentPage.value, limit: pageSize.value })
}
</script>
