<template>
  <div>
    <div class="d-flex justify-content-between mb-3">
      <h4>Quản lý mượn trả</h4>
      <button class="btn btn-primary" @click="openCreate">Tạo phiếu mượn</button>
    </div>

    <TableBasic :columns="cols" :rows="loans">
      <template #row-actions="{ row }">
        <button class="btn btn-sm btn-outline-success me-1" @click="approve(row)">Duyệt</button>
        <button class="btn btn-sm btn-outline-secondary" @click="detail(row)">Chi tiết</button>
      </template>
    </TableBasic>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TableBasic from '@/components/TableBasic.vue'
import api from '@/services/api'

const loans = ref([])
const cols = [
  { key: 'code', label: 'Mã phiếu' },
  { key: 'readerName', label: 'Người mượn' },
  { key: 'bookCount', label: 'Số lượng' },
  { key: 'status', label: 'Trạng thái' }
]

onMounted(async () => {
  loans.value = [
    { _id:'m1', code:'PM001', readerName:'Nguyễn A', bookCount:2, status:'PENDING' },
    { _id:'m2', code:'PM002', readerName:'Trần B', bookCount:1, status:'APPROVED' }
  ]
})

function openCreate(){ alert('Open create loan modal') }
function approve(row){ row.status = 'APPROVED' }
function detail(row){ alert(JSON.stringify(row, null, 2)) }
</script>
