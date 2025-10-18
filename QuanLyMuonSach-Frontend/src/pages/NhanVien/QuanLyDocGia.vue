<template>
  <div>
    <div class="d-flex justify-content-between mb-3">
      <h4>Quản lý độc giả</h4>
      <button class="btn btn-primary" @click="openAdd">Thêm độc giả</button>
    </div>

    <TableBasic :columns="cols" :rows="readers">
      <template #row-actions="{ row }">
        <button class="btn btn-sm btn-outline-secondary me-1" @click="view(row)">Xem</button>
        <button class="btn btn-sm btn-outline-danger" @click="remove(row)">Xóa</button>
      </template>
    </TableBasic>

    <div class="mt-3">
      <p class="text-muted small">Tạm thời dữ liệu demo. Kết nối API khi backend xong.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TableBasic from '@/components/TableBasic.vue'
import api from '@/services/api'

const readers = ref([])
const cols = [
  { key: 'maDocGia', label: 'Mã' },
  { key: 'fullName', label: 'Họ & tên' },
  { key: 'ngaySinh', label: 'Ngày sinh' },
  { key: 'dienThoai', label: 'SĐT' }
]

onMounted(async () => {
  // fetch readers from API
  // const { data } = await api.get('/docgia')
  readers.value = [
    { _id: 'd1', maDocGia: 'DG001', fullName: 'Nguyễn Văn A', ngaySinh: '1990-01-01', dienThoai: '0123456789' },
    { _id: 'd2', maDocGia: 'DG002', fullName: 'Trần Thị B', ngaySinh: '1992-05-06', dienThoai: '0987654321' }
  ]
})

function openAdd(){ alert('Open add modal (implement later)') }
function view(row){ alert(JSON.stringify(row, null, 2)) }
function remove(row){
  if(confirm('Xác nhận xóa?')) readers.value = readers.value.filter(r=>r._id!==row._id)
}
</script>
