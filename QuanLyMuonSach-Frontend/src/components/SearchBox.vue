<!-- src/components/common/SearchBox.vue -->
<template>
  <div class="search-box">
    <div class="input-group">
      <span class="input-group-text">
        <i class="bi bi-search"></i>
      </span>
      <input
        type="text"
        class="form-control"
        :placeholder="placeholder"
        v-model="searchTerm"
        @input="onSearch"
        @keyup.enter="emitSearch"
      />
      <button
        v-if="searchTerm"
        class="btn btn-outline-secondary"
        type="button"
        @click="clearSearch"
        title="Xóa tìm kiếm"
      >
        <i class="bi bi-x"></i>
      </button>
      <button
        class="btn btn-primary"
        type="button"
        @click="emitSearch"
      >
        Tìm kiếm
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Tìm kiếm...'
  },
  debounce: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['search'])

const searchTerm = ref('')
let timeoutId = null

const onSearch = () => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    emitSearch()
  }, props.debounce)
}

const emitSearch = () => {
  emit('search', searchTerm.value.trim())
}

const clearSearch = () => {
  searchTerm.value = ''
  emitSearch()
}
</script>

<style scoped>
.search-box {
  max-width: 400px;
}
</style>