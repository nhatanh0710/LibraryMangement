<template>
  <div>
    <div class="d-flex justify-content-between mb-3">
      <h4>Quản lý Nhà xuất bản</h4>
      <button class="btn btn-primary" @click="addNXB">Thêm NXB</button>
    </div>

    <TableBasic :columns="cols" :rows="nxbs">
      <template #row-actions="{ row }">
        <button class="btn btn-sm btn-outline-secondary me-1" @click="edit(row)">Sửa</button>
        <button class="btn btn-sm btn-outline-danger" @click="remove(row)">Xóa</button>
      </template>
    </TableBasic>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TableBasic from '@/components/TableBasic.vue'
import api from '@/services/api'

const nxbs = ref([])
const cols = [
  { key: 'ma', label: 'Mã' },
  { key: 'ten', label: 'Tên' },
  { key: 'diaChi', label: 'Địa chỉ' }
]

onMounted(async () => {
  nxbs.value = [
    { _id:'nxb1', ma:'NXB001', ten:'NXB A', diaChi:'Hà Nội' },
    { _id:'nxb2', ma:'NXB002', ten:'NXB B', diaChi:'HCM' }
  ]
})

function addNXB(){ alert('Add NXB modal') }
function edit(r){ alert('Edit ' + r.ten) }
function remove(r){ if(confirm('Xóa NXB?')) nxbs.value = nxbs.value.filter(x=>x._id!==r._id) }
</script>
