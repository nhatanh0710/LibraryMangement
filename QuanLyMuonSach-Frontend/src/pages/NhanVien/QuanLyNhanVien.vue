<template>
  <div>
    <div class="d-flex justify-content-between mb-3">
      <h4>Quản lý nhân viên</h4>
      <button class="btn btn-primary" @click="openAdd">Thêm nhân viên</button>
    </div>

    <TableBasic :columns="cols" :rows="staffs">
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

const staffs = ref([])
const cols = [
  { key: 'msnv', label: 'MSNV' },
  { key: 'hoTenNV', label: 'Họ tên' },
  { key: 'chucVu', label: 'Chức vụ' },
  { key: 'soDienThoai', label: 'SĐT' }
]

onMounted(async () => {
  // const { data } = await api.get('/nhanvien')
  staffs.value = [
    { _id: 'n1', msnv: 'admin', hoTenNV: 'Admin', chucVu: 'GIÁM ĐỐC', soDienThoai: '0123' },
    { _id: 'n2', msnv: 'nv01', hoTenNV: 'Nhân Viên 1', chucVu: 'NHÂN VIÊN', soDienThoai: '0456' }
  ]
})

function openAdd(){ alert('Implement add staff modal') }
function edit(row){ alert('Edit: ' + row.hoTenNV) }
function remove(row){ if(confirm('Xóa?')) staffs.value = staffs.value.filter(s=>s._id!==row._id) }
</script>
