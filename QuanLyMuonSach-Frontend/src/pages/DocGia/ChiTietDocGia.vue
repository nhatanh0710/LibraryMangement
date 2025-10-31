<template>
  <div class="card mb-3">
    <div class="card-body">
      <h5 class="card-title d-flex justify-content-between align-items-center">
        <span>Tài khoản</span>
        <small v-if="user?.maDocGia" class="text-muted">{{ user.maDocGia }}</small>
      </h5>

      <div v-if="user">
        <div class="mb-1"><strong>Mã độc giả:</strong> {{ user.maDocGia || '—' }}</div>
        <div class="mb-1"><strong>Họ và tên:</strong> {{ user.hoLot }} {{ user.ten }}</div>
        <div class="mb-1"><strong>Ngày sinh:</strong> {{ formatDate(user.ngaySinh) || '—' }}</div>
        <div class="mb-1"><strong>Giới tính:</strong> {{ user.phai || '—' }}</div>
        <div class="mb-1"><strong>Địa chỉ:</strong> {{ user.diaChi || '—' }}</div>
        <div class="mb-1"><strong>SĐT:</strong> {{ user.dienThoai || '—' }}</div>

        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" @click="openEdit">Sửa thông tin</button>
          <button class="btn btn-outline-secondary btn-sm" @click="openChangePassword">Đổi mật khẩu</button>
        </div>

        <BorrowHistory />
      </div>

      <div v-else class="text-muted">Bạn chưa đăng nhập.</div>
    </div>
  </div>

  <DocGiaForm v-if="showEdit" :initial="user" @saved="onSaved" @close="closeEdit" />
<!-- <ChangePasswordModal v-if="showPw" :userId="user._id || user.id" @changed="onPwChanged" @close="closeChangePassword" /> -->
</template>

<script setup>
import { ref } from 'vue'
import DocGiaForm from '@/components/DocGiaForm.vue'

//import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import { useUserStore } from '@/stores/users'
import BorrowHistory from '../../components/BorrowHistory.vue'

const userStore = useUserStore()
const raw = localStorage.getItem('user')
let parsed = null
try { parsed = raw ? JSON.parse(raw) : null } catch {}
const user = parsed || userStore.user || null

const showEdit = ref(false)
const showPw = ref(false)

function formatDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString() } catch { return iso }
}

function openEdit() { showEdit.value = true }
function closeEdit() { showEdit.value = false }
function openChangePassword() { showPw.value = true }
function closeChangePassword() { showPw.value = false }

function onSaved(saved) {
  // saved might be API response shape; try to normalize
  const newUser = saved?.data || saved || null
  const final = newUser || { ...user, ...saved }
  localStorage.setItem('user', JSON.stringify(final))
  if (userStore) userStore.user = final
  showEdit.value = false
  alert('Cập nhật thông tin thành công')
}

function onPwChanged() {
  showPw.value = false
  alert('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
  // optional: force logout
  userStore.logout?.()
  location.href = '/login'
}
</script>

<style scoped>
.card { border-radius: 10px; }
</style>
