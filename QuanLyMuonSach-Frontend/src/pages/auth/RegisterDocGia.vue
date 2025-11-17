<template>
  <FormWrapper title="Đăng ký độc giả">
    <form @submit.prevent="onSubmit">
      <InputField v-model="maDocGia" label="Mã độc giả" placeholder="VD: DG001" />
      <InputField v-model="hoLot" label="Họ lót" />
      <InputField v-model="ten" label="Tên" />
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

const maDocGia = ref('')
const hoLot = ref('')
const ten = ref('')
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
    await api.post('/docgia/register', {
      maDocGia: maDocGia.value,
      hoLot: hoLot.value,
      ten: ten.value,
      password: password.value
    })
    alert('Đăng ký thành công. Vui lòng đăng nhập.')
    router.push('/login')
  } catch (err) {
    error.value = err.response?.data?.message || 'Đăng ký thất bại'
  } finally {
    loading.value = false
  }
}
</script>
