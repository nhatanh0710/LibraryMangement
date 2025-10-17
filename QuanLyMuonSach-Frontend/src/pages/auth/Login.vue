<template>
  <FormWrapper title="Đăng nhập">
    <form @submit.prevent="onSubmit">
      <InputField v-model="account" label="Tài khoản (MSNV hoặc email)" placeholder="Nhập MSNV hoặc email" />
      <InputField v-model="password" type="password" label="Mật khẩu" placeholder="Nhập mật khẩu" />
      <div v-if="error" class="alert alert-danger py-1 small">{{ error }}</div>

      <SubmitButton type="submit" :disabled="loading" :label="loading ? 'Đang...' : 'Đăng nhập'" />

      <div class="text-center mt-3">
        <router-link to="/register">Đăng ký độc giả</router-link>
        <span class="mx-2">|</span>
        <router-link to="/register-staff">Đăng ký nhân viên</router-link>
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
    // support msnv or email: pass as msnv for staff login; BE decides
    await userStore.login(account.value, password.value)
    const redirect = route.query.redirect || '/admin'
    router.push(redirect)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}
</script>
