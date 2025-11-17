<template>
  <FormWrapper title="Đăng ký nhân viên" width="480px">
    <form @submit.prevent="onSubmit">
      <InputField v-model="msnv" label="Mã số nhân viên" placeholder="VD: NV001" />
      <InputField v-model="hoTenNV" label="Họ tên" placeholder="Tên đầy đủ" />
      <InputField v-model="password" type="password" label="Mật khẩu" />
      <InputField v-model="confirm" type="password" label="Xác nhận mật khẩu" />
      <div v-if="error" class="alert alert-danger py-1 small">{{ error }}</div>
      <SubmitButton type="submit" :disabled="loading" variant="success" :label="loading ? 'Đang...' : 'Đăng ký'" />
      <div class="text-center mt-3">
        <router-link to="/login">Quay lại đăng nhập</router-link>
      </div>
    </form>
  </FormWrapper>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'
import InputField from '@/components/Home/InputField.vue'
import SubmitButton from '@/components/Home/SubmitButton.vue'
import FormWrapper from '@/components/FormWrapper.vue'

const msnv = ref('')
const hoTenNV = ref('')
const password = ref('')
const confirm = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

async function onSubmit() {
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = 'Mật khẩu và xác nhận không khớp'
    return
  }
  loading.value = true
  try {
    await api.post('/nhanvien/register', { msnv: msnv.value, hoTenNV: hoTenNV.value, password: password.value })
    alert('Đăng ký nhân viên thành công')
    router.push('/login')
  } catch (err) {
    error.value = err.response?.data?.message || 'Đăng ký thất bại'
  } finally {
    loading.value = false
  }
}
</script>
