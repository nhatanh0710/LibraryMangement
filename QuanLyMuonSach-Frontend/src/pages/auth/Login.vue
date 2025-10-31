<template>
  <FormWrapper title="Đăng nhập">
    <form @submit.prevent="onSubmit">
      <InputField v-model="account" label="Tài khoản (MSNV hoặc NSDG)" placeholder="Nhập MSNV hoặc email" />
      <InputField v-model="password" type="password" label="Mật khẩu" placeholder="Nhập mật khẩu" />
      <div v-if="error" class="alert alert-danger py-1 small">{{ error }}</div>

      <SubmitButton type="submit" :disabled="loading" :label="loading ? 'Đang...' : 'Đăng nhập'" />

      <div class="text-center mt-3">
        <router-link to="/register">Đăng ký độc giả</router-link>
        <span class="mx-2">|</span>
      </div>
    </form>
  </FormWrapper>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/users'
import InputField from '@/components/InputField.vue'
import SubmitButton from '@/components/SubmitButton.vue'
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
