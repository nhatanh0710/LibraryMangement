<template>
  <div class="register-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="register-card">
            <div class="row g-0">
              <!-- Left Side - Illustration -->
              <div class="col-md-6 d-none d-md-flex illustration-side">
                <div class="illustration-content">
                  <div class="library-icon">
                    <i class="bi bi-book-half"></i>
                  </div>
                  <h3 class="illustration-title">Tham gia NA Library</h3>
                  <p class="illustration-text">
                    Khám phá thế giới tri thức với hàng ngàn đầu sách đa dạng
                  </p>
                  <div class="features-list">
                    <div class="feature-item">
                      <i class="bi bi-check-circle"></i>
                      <span>Truy cập miễn phí</span>
                    </div>
                    <div class="feature-item">
                      <i class="bi bi-check-circle"></i>
                      <span>Mượn sách dễ dàng</span>
                    </div>
                    <div class="feature-item">
                      <i class="bi bi-check-circle"></i>
                      <span>Theo dõi lịch sử</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Side - Form -->
              <div class="col-md-6 form-side">
                <FormWrapper title="Đăng ký độc giả" class="h-100">
                  <form @submit.prevent="onSubmit" class="h-100 d-flex flex-column">
                    <div class="form-content">
                      <InputField 
                        v-model="maDocGia" 
                        label="Mã độc giả" 
                        placeholder="VD: DG001"
                        icon="bi-person-badge"
                        required
                      />
                      <div class="row">
                        <div class="col-md-6">
                          <InputField 
                            v-model="hoLot" 
                            label="Họ lót" 
                            placeholder="Nhập họ lót"
                            required
                          />
                        </div>
                        <div class="col-md-6">
                          <InputField 
                            v-model="ten" 
                            label="Tên" 
                            placeholder="Nhập tên"
                            required
                          />
                        </div>
                      </div>
                      <InputField 
                        v-model="password" 
                        type="password" 
                        label="Mật khẩu" 
                        placeholder="Nhập mật khẩu"
                        icon="bi-lock"
                        required
                      />
                      <InputField 
                        v-model="confirm" 
                        type="password" 
                        label="Xác nhận mật khẩu" 
                        placeholder="Nhập lại mật khẩu"
                        icon="bi-shield-lock"
                        required
                      />
                      
                      <div v-if="error" class="alert alert-danger py-2 small mt-2">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        {{ error }}
                      </div>

                      <SubmitButton 
                        type="submit" 
                        :disabled="loading" 
                        variant="primary" 
                        :label="loading ? 'Đang đăng ký...' : 'Đăng ký ngay'"
                        class="w-100 mt-3"
                        size="lg"
                      />
                    </div>

                    <div class="form-footer mt-auto">
                      <div class="text-center">
                        <p class="mb-2">Đã có tài khoản?</p>
                        <router-link to="/login" class="btn btn-outline-primary btn-sm">
                          <i class="bi bi-arrow-left me-1"></i>
                          Quay lại đăng nhập
                        </router-link>
                      </div>
                    </div>
                  </form>
                </FormWrapper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
  
  // Validation
  if (!maDocGia.value || !hoLot.value || !ten.value || !password.value) {
    error.value = 'Vui lòng điền đầy đủ thông tin'
    return
  }
  
  if (password.value !== confirm.value) {
    error.value = 'Mật khẩu và xác nhận không khớp'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
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
    alert('Đăng ký thành công! Vui lòng đăng nhập để bắt đầu sử dụng thư viện.')
    router.push('/login')
  } catch (err) {
    error.value = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--muted-100) 100%);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.register-card {
  background: var(--surface-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid var(--muted-200);
}

.illustration-side {
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
  color: white;
  padding: 3rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-content {
  text-align: center;
  max-width: 300px;
}

.library-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.illustration-title {
  font-weight: 700;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.illustration-text {
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.features-list {
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.feature-item i {
  color: var(--accent-300);
  margin-right: 0.5rem;
  font-size: 1rem;
}

.form-side {
  padding: 0;
}

.form-content {
  flex: 1;
}

.form-footer {
  padding-top: 1.5rem;
  border-top: 1px solid var(--muted-200);
}

/* Responsive */
@media (max-width: 768px) {
  .register-page {
    padding: 1rem;
  }
  
  .register-card {
    border-radius: var(--radius-lg);
  }
  
  .illustration-side {
    padding: 2rem 1.5rem;
  }
  
  .library-icon {
    font-size: 3rem;
  }
  
  .illustration-title {
    font-size: 1.3rem;
  }
}

@media (max-width: 576px) {
  .register-page {
    padding: 0.5rem;
  }
  
  .illustration-side {
    padding: 1.5rem 1rem;
  }
  
  .library-icon {
    font-size: 2.5rem;
  }
}
</style>