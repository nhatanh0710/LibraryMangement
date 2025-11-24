<template>
  <div class="staff-detail">
    <div class="d-flex align-items-center mb-4">
      <i class="bi bi-person-badge fs-3 text-primary me-3"></i>
      <div>
        <h4 class="mb-1">Thông tin nhân viên</h4>
        <p class="text-muted mb-0">Chi tiết hồ sơ nhân viên</p>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <div class="row">
          <div class="col-md-6">
            <div class="info-item mb-3">
              <label class="info-label">Mã nhân viên</label>
              <div class="info-value">{{ staff?.msnv || '—' }}</div>
            </div>
            
            <div class="info-item mb-3">
              <label class="info-label">Họ và tên</label>
              <div class="info-value">{{ staff?.hoTenNV || '—' }}</div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="info-item mb-3">
              <label class="info-label">Chức vụ</label>
              <div class="info-value">
                <span class="badge bg-primary">{{ staff?.chucVu || '—' }}</span>
              </div>
            </div>
            
            <div class="info-item mb-3">
              <label class="info-label">Số điện thoại</label>
              <div class="info-value">
                <i class="bi bi-telephone me-2 text-muted"></i>
                {{ staff?.soDienThoai || '—' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const staff = ref(null)

onMounted(async () => {
  const id = route.params.id
  try {
    // const { data } = await api.get(`/nhanvien/${id}`)
    // staff.value = data
    // demo:
    staff.value = { 
      msnv: 'NV001', 
      hoTenNV: 'Nguyễn Văn Admin', 
      chucVu: 'GIÁM ĐỐC', 
      soDienThoai: '0123 456 789' 
    }
  } catch (e) { 
    console.error(e) 
  }
})
</script>

<style scoped>
.staff-detail {
  max-width: 800px;
  margin: 0 auto;
}

.info-item {
  padding: 0.5rem 0;
}

.info-label {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  display: block;
}

.info-value {
  font-size: 1rem;
  color: var(--text-dark);
  font-weight: 500;
}

.card {
  border-radius: 12px;
  background: var(--surface-white);
}

.badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}
</style>