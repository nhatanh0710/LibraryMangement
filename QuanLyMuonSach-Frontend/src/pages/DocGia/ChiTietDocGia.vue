<template>
  <div class="account-card">
    <div class="card-header-section">
      <div class="user-avatar">
        <i class="bi bi-person-circle"></i>
      </div>
      <div class="user-basic-info">
        <h4 class="user-name">{{ user.hoLot }} {{ user.ten }}</h4>
        <div class="user-code">
          <i class="bi bi-person-badge"></i>
          {{ user.maDocGia || '—' }}
        </div>
      </div>
    </div>

    <div class="card-body">
      <!-- Thông tin cá nhân -->
      <div class="info-section">
        <h6 class="section-title">
          <i class="bi bi-info-circle"></i>
          Thông tin cá nhân
        </h6>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon">
              <i class="bi bi-calendar3"></i>
            </div>
            <div class="info-content">
              <label>Ngày sinh</label>
              <span class="info-value">{{ formatDate(user.ngaySinh) || '—' }}</span>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">
              <i class="bi bi-gender-ambiguous"></i>
            </div>
            <div class="info-content">
              <label>Giới tính</label>
              <span class="info-value">{{ getGenderText(user.phai) || '—' }}</span>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">
              <i class="bi bi-geo-alt"></i>
            </div>
            <div class="info-content">
              <label>Địa chỉ</label>
              <span class="info-value">{{ user.diaChi || '—' }}</span>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-icon">
              <i class="bi bi-telephone"></i>
            </div>
            <div class="info-content">
              <label>Số điện thoại</label>
              <span class="info-value">{{ user.dienThoai || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-section">
        <button class="btn btn-primary btn-action" @click="openEdit">
          <i class="bi bi-pencil-square"></i>
          Chỉnh sửa thông tin
        </button>
        <button class="btn btn-outline-secondary btn-action" @click="openChangePassword">
          <i class="bi bi-shield-lock"></i>
          Đổi mật khẩu
        </button>
      </div>

      
    </div>
  </div>

  <!-- Modal forms -->
  <DocGiaForm v-if="showEdit" :initial="user" @saved="onSaved" @close="closeEdit" />
</template>

<script setup>
import { ref } from 'vue'
import DocGiaForm from '@/components/DocGiaForm.vue'
import BorrowHistory from '@/components/BorrowHistory.vue'
import { useUserStore } from '@/stores/users'

const userStore = useUserStore()
const raw = localStorage.getItem('user')
let parsed = null
try { parsed = raw ? JSON.parse(raw) : null } catch {}
const user = parsed || userStore.user || null

const showEdit = ref(false)
const showPw = ref(false)

function formatDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('vi-VN') } catch { return iso }
}

function getGenderText(phai) {
  const genderMap = {
    'NAM': 'Nam',
    'NU': 'Nữ',
    'M': 'Nam', 
    'F': 'Nữ',
    'male': 'Nam',
    'female': 'Nữ'
  }
  return genderMap[phai?.toUpperCase()] || phai || '—'
}

function openEdit() { showEdit.value = true }
function closeEdit() { showEdit.value = false }

function openChangePassword() { showPw.value = true }
function closeChangePassword() { showPw.value = false }

function onSaved(saved) {
  const newUser = saved?.data || saved || null
  const final = newUser || { ...user, ...saved }
  localStorage.setItem('user', JSON.stringify(final))
  if (userStore) userStore.user = final
  showEdit.value = false
  alert('Cập nhật thông tin thành công')
}
</script>

<style scoped>
.account-card {
  border: none;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  background: var(--surface-white);
  overflow: hidden;
}

.card-header-section {
  background: linear-gradient(135deg, var(--primary-700) 0%, var(--primary-500) 100%);
  color: white;
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.user-avatar {
  font-size: 3rem;
  opacity: 0.9;
}

.user-basic-info {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 var(--space-xs) 0;
  color: white;
}

.user-code {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.9rem;
  opacity: 0.9;
  font-family: monospace;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  display: inline-flex;
}

.card-body {
  padding: var(--space-lg);
}

.info-section {
  margin-bottom: var(--space-lg);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--primary-800);
  font-weight: 600;
  margin-bottom: var(--space-md);
  font-size: 1.1rem;
}

.section-title i {
  color: var(--primary-700);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-md);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space);
  padding: var(--space);
  background: var(--muted-100);
  border-radius: var(--radius);
  border-left: 3px solid var(--accent-300);
  transition: all var(--transition-fast);
}

.info-item:hover {
  background: var(--muted-200);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.info-icon {
  color: var(--primary-700);
  font-size: 1.2rem;
  margin-top: 2px;
}

.info-content {
  flex: 1;
}

.info-content label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  display: block;
  color: var(--text-dark);
  font-weight: 500;
  font-size: 0.95rem;
}

.action-section {
  display: flex;
  gap: var(--space);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 500;
  transition: all var(--transition);
  flex: 1;
  min-width: 200px;
  justify-content: center;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.history-section {
  border-top: 1px solid var(--muted-200);
  padding-top: var(--space-lg);
}

/* Responsive */
@media (max-width: 768px) {
  .card-header-section {
    flex-direction: column;
    text-align: center;
    padding: var(--space-md);
  }
  
  .user-avatar {
    font-size: 2.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .btn-action {
    min-width: auto;
    width: 100%;
  }
  
  .info-item {
    padding: var(--space);
  }
}

@media (max-width: 576px) {
  .card-body {
    padding: var(--space);
  }
  
  .user-name {
    font-size: 1.3rem;
  }
  
  .section-title {
    font-size: 1rem;
  }
}
</style>