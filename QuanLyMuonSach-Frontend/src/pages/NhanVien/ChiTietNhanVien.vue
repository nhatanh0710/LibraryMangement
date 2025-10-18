<template>
  <div>
    <h4>Chi tiết nhân viên</h4>
    <div class="card p-3 mt-3">
      <div><strong>MSNV:</strong> {{ staff?.msnv }}</div>
      <div><strong>Họ tên:</strong> {{ staff?.hoTenNV }}</div>
      <div><strong>Chức vụ:</strong> {{ staff?.chucVu }}</div>
      <div><strong>ĐT:</strong> {{ staff?.soDienThoai }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const staff = ref(null)

onMounted(async () => {
  const id = route.params.id
  try {
    // const { data } = await api.get(`/nhanvien/${id}`)
    // staff.value = data
    // demo:
    staff.value = { msnv: 'admin', hoTenNV: 'Admin Mock', chucVu: 'GIÁM ĐỐC', soDienThoai: '012345' }
  } catch (e) { console.error(e) }
})
</script>
