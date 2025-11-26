<template>
  <nav v-if="totalPages > 1" class="mt-4">
    <div class="pagination-container">
      <!-- Pagination Controls - Căn giữa -->
      <div class="pagination-center">
        <!-- Page Size Selector -->
        <div class="page-size-selector">
          <label class="form-label small text-muted mb-1">Số lượng / trang</label>
          <select class="form-select form-select-sm" v-model.number="pageSize" @change="emitLimit" style="width: 100px;">
            <option v-for="opt in [8, 12, 16, 20]" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <!-- Pagination Buttons -->
        <ul class="pagination pagination-sm mb-0">
          <!-- First Page -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goTo(1)" :disabled="currentPage === 1" title="Trang đầu">
              <i class="bi bi-chevron-double-left"></i>
            </button>
          </li>

          <!-- Previous Page -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goTo(currentPage - 1)" :disabled="currentPage === 1" title="Trang trước">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>

          <!-- Page Numbers -->
          <li v-for="p in pagesToShow" :key="p" class="page-item" :class="{ active: p === currentPage }">
            <button class="page-link" @click="goTo(p)">
              {{ p }}
            </button>
          </li>

          <!-- Next Page -->
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goTo(currentPage + 1)" :disabled="currentPage === totalPages" title="Trang sau">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>

          <!-- Last Page -->
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goTo(totalPages)" :disabled="currentPage === totalPages" title="Trang cuối">
              <i class="bi bi-chevron-double-right"></i>
            </button>
          </li>
        </ul>

        <!-- Quick Page Input -->
        <div class="quick-jump d-flex align-items-center gap-1">
          <span class="small text-muted">Đến</span>
          <input 
            type="number" 
            class="form-control form-control-sm" 
            style="width: 70px;"
            :min="1" 
            :max="totalPages"
            v-model.number="jumpPage"
            @keyup.enter="goTo(jumpPage)"
            @blur="goTo(jumpPage)"
          >
          <span class="small text-muted">/ {{ totalPages }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, toRefs, watch } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  limit: { type: Number, default: 12 },
  maxButtons: { type: Number, default: 5 },
  totalItems: { type: Number, default: 0 }
})

const emit = defineEmits(['update:page', 'update:limit', 'change'])

const { page: pageProp, totalPages: totalPagesProp, limit: limitProp, totalItems: totalItemsProp } = toRefs(props)

const currentPage = computed(() => Math.max(1, Math.min(pageProp.value, totalPagesProp.value)))
const totalPages = computed(() => Math.max(1, totalPagesProp.value))
const totalItems = computed(() => Math.max(0, totalItemsProp.value))
const pageSize = ref(limitProp.value)
const jumpPage = ref(pageProp.value)

// Tính toán số item đang hiển thị
const startItem = computed(() => ((currentPage.value - 1) * pageSize.value) + 1)
const endItem = computed(() => Math.min(currentPage.value * pageSize.value, totalItems.value))

// Đồng bộ khi prop thay đổi
watch(limitProp, val => (pageSize.value = val))
watch(pageProp, val => (jumpPage.value = val))

// Tính danh sách trang hiển thị
const pagesToShow = computed(() => {
  const max = Math.max(3, props.maxButtons)
  let start = Math.max(1, currentPage.value - Math.floor(max / 2))
  let end = Math.min(totalPages.value, start + max - 1)
  
  // Điều chỉnh nếu không đủ max buttons
  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1)
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function goTo(p) {
  if (!p || p < 1) p = 1
  if (p > totalPages.value) p = totalPages.value
  
  // Reset jump page input
  jumpPage.value = p
  
  if (p !== currentPage.value) {
    emit('update:page', p)
    emit('change', { page: p, limit: pageSize.value })
  }
}

function emitLimit() {
  emit('update:limit', pageSize.value)
  emit('change', { page: 1, limit: pageSize.value }) // Reset về trang 1 khi đổi limit
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.pagination-center {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
}

.pagination {
  --bs-pagination-color: #6b7280;
  --bs-pagination-hover-color: #374151;
  --bs-pagination-active-bg: #116466;
  --bs-pagination-active-border-color: #116466;
  margin: 0;
}

.page-link {
  border-radius: 6px;
  margin: 0 2px;
  min-width: 38px;
  text-align: center;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.page-link:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.page-item.active .page-link {
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(17, 100, 102, 0.2);
}

.page-item.disabled .page-link {
  color: #9ca3af;
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.page-size-selector {
  min-width: 120px;
}

.quick-jump input {
  border-radius: 6px;
  text-align: center;
}

.form-select-sm, .form-control-sm {
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

/* Responsive */
@media (max-width: 768px) {
  .pagination-center {
    flex-direction: column;
    gap: 1rem;
  }
  
  .page-size-selector {
    min-width: 100px;
  }
  
  .quick-jump {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .pagination-center {
    gap: 0.75rem;
  }
  
  .page-link {
    min-width: 32px;
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
  }
  
  .quick-jump {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>