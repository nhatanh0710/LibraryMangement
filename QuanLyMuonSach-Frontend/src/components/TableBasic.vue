<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div><slot name="title"></slot></div>
      <div><slot name="actions"></slot></div>
    </div>

    <table class="table table-sm table-hover">
      <thead class="table-light">
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
          <th v-if="hasActions">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in rows" :key="row._id || idx">
          <td v-for="col in columns" :key="col.key">
            <span v-if="!col.render">{{ getCell(row, col) }}</span>
            <span v-else v-html="col.render(row)"></span>
          </td>
          <td v-if="hasActions">
            <slot name="row-actions" :row="row"></slot>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length + (hasActions ? 1 : 0)" class="text-center text-muted">
            Không có dữ liệu
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  hasActions: { type: Boolean, default: true }
})

function getCell(row, col) {
  if (!col || !col.key) return ''
  const parts = String(col.key).split('.')
  let v = row
  for (const p of parts) {
    if (v == null) return ''
    v = v[p]
  }
  return v == null ? '' : v
}
</script>

<style scoped>
.table td, .table th { vertical-align: middle; }
</style>
