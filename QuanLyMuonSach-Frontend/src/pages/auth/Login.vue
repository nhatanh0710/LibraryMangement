<template>
  <div class="login-page">
   <div class="login-left">
    <FormWrapper title="Đăng nhập">
    <form @submit.prevent="onSubmit">
      <InputField v-model="account" label="Tài khoản (MSNV hoặc MSDG)" placeholder="Nhập MSNV hoặc MSDG" />
      <InputField v-model="password" type="password" label="Mật khẩu" placeholder="Nhập mật khẩu" />
      <div v-if="error" class="alert alert-danger py-1 small">{{ error }}</div>

      <SubmitButton type="submit" :disabled="loading" :label="loading ? 'Đang...' : 'Đăng nhập'" />

      <div class="text-center mt-3">
        <router-link to="/register">Đăng ký độc giả</router-link>
      </div>
    </form>
  </FormWrapper>
   </div>
   <div class="login-right">
      <h1 class="intro-title">📚 Hệ thống Quản Lý Mượn Sách</h1>

      <p class="intro-desc">
        Nền tảng hỗ trợ độc giả và nhân viên thư viện trong việc mượn – trả sách nhanh chóng,
        chính xác và tiện lợi.
      </p>

      <ul class="intro-list">
        <li>🔍 Tìm kiếm & xem thông tin sách</li>
        <li>📘 Mượn sách online</li>
        <li>🧾 Theo dõi lịch sử mượn – trả</li>
        <li>👨‍💼 Quản lý sách & độc giả</li>
      </ul>

      <p class="intro-footer">Chào mừng bạn đến với thư viện!</p>
    </div>
 </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/users'
import InputField from '@/components/Home/InputField.vue'
import SubmitButton from '@/components/Home/SubmitButton.vue'
import FormWrapper from '@/components/FormWrapper.vue'

const account = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    //lấy MSNV hoặc MSDG
    await userStore.login(account.value, password.value)
   const redirectQuery = route.query.redirect;
if (redirectQuery) {
  router.push(redirectQuery);
} else {
  // choose by user type
  const dest = userStore.user?.type === 'DOCGIA' ? '/docgia/trang-chu' : '/admin';
  router.push(dest);
}
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

/* LEFT FORM */
.login-left {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: #ffffff;
}

.error-msg {
  margin-top: 10px;
  color: red;
}

/* RIGHT INTRO */
.login-right {
  flex: 1;
  padding: 60px;
  background: #D1E8E2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #2C3531;
}

.intro-title {
  color: #116466;
  margin-bottom: 20px;
}

.intro-desc {
  margin-bottom: 20px;
}

.intro-list li {
  margin-bottom: 10px;
}

.intro-footer {
  margin-top: 30px;
  font-weight: bold;
  color: #116466;
}
</style>
