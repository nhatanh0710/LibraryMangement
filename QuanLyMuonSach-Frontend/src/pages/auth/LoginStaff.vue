<template>
  <div class="admin-login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <div class="library-icon">📚</div>
        <h1>Đăng nhập Hệ thống Quản trị</h1>
        <p>Dành cho Nhân viên Thư viện</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="onSubmit" class="login-form">
        <div class="input-group">
          <label>
            <span class="icon">👤</span>
            Tài khoản (MSNV)
          </label>
          <input
            v-model="account"
            type="text"
            placeholder="Nhập mã số nhân viên"
            required
            :disabled="loading"
          />
        </div>

        <div class="input-group">
          <label>
            <span class="icon">🔒</span>
            Mật khẩu
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="Nhập mật khẩu"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="error-alert">
          ⚠️ {{ error }}
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>

        <div class="login-footer">
          <div class="system-info">
            <span>🛡️ Hệ thống bảo mật</span>
            <span>⏰ 24/7</span>
          </div>
          <div class="help-text">
            Liên hệ <a href="#" class="support-link">IT Support</a> nếu gặp vấn đề
          </div>
        </div>
      </form>
    </div>

    <div class="login-sidebar">
      <div class="sidebar-content">
        <h2>Hệ thống Quản trị Thư viện</h2>
        
        <div class="feature-highlight">
          <div class="feature-item">
            <span class="feature-icon">📊</span>
            Dashboard & Báo cáo
          </div>
          <div class="feature-item">
            <span class="feature-icon">📚</span>
            Quản lý Sách
          </div>
          <div class="feature-item">
            <span class="feature-icon">👥</span>
            Quản lý Độc giả
          </div>
        </div>

        <div class="quick-stats">
          <div class="stat">
            <div class="stat-value">500+</div>
            <div class="stat-label">Đầu sách</div>
          </div>
          <div class="stat">
            <div class="stat-value">2K+</div>
            <div class="stat-label">Độc giả</div>
          </div>
        </div>

        <div class="admin-notice">
          <p>⚠️ <strong>Lưu ý:</strong> Chỉ nhân viên thư viện được truy cập</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/users'

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
    await userStore.login(account.value, password.value)
    
    const redirectQuery = route.query.redirect;
    if (redirectQuery) {
      router.push(redirectQuery);
    } else {
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
.admin-login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.library-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 24px;
  color: #2d3748;
  margin-bottom: 8px;
  font-weight: 600;
}

.login-header p {
  color: #718096;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.input-group input {
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s;
  background: #f8fafc;
}

.input-group input:focus {
  outline: none;
  border-color: #4299e1;
  background: white;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.input-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-alert {
  background: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-btn {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 153, 225, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.system-info {
  display: flex;
  justify-content: space-around;
  color: #718096;
  font-size: 12px;
  margin-bottom: 10px;
}

.help-text {
  text-align: center;
  color: #a0aec0;
  font-size: 12px;
}

.support-link {
  color: #4299e1;
  text-decoration: none;
  font-weight: 600;
}

.support-link:hover {
  text-decoration: underline;
}

/* Sidebar */
.login-sidebar {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: white;
  padding: 40px;
  width: 350px;
  border-radius: 16px;
  margin-left: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.sidebar-content h2 {
  font-size: 22px;
  margin-bottom: 30px;
  color: #e2e8f0;
  text-align: center;
}

.feature-highlight {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  font-size: 14px;
  transition: background 0.3s;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.feature-icon {
  font-size: 20px;
}

.quick-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  margin: 30px 0;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #4299e1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #a0aec0;
}

.admin-notice {
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.3);
  border-radius: 10px;
  padding: 12px;
  font-size: 13px;
  color: #fed7d7;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .admin-login-container {
    flex-direction: column;
  }
  
  .login-sidebar {
    width: 100%;
    margin-left: 0;
    margin-top: 20px;
  }
}
</style>