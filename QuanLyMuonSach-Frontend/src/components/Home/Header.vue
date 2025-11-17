<template>
  <header class="app-header navbar navbar-expand-lg shadow-sm">
    <div class="container-fluid">
      <img src="@/assets/favicon.ico.png" alt="logo" width="40" height="40"  />
      <router-link class="navbar-brand fw-bold text-white" to="/">
         NA Library
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#topNavbar"
        aria-controls="topNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="topNavbar">
        <form class="d-flex ms-auto my-2 my-lg-0" @submit.prevent="onSearch">
          <input
            v-model="q"
            class="form-control form-control-sm me-2"
            type="search"
            placeholder="Tìm sách, tác giả..."
            aria-label="Search"
          />
          <button class="btn btn-sm btn-light" type="submit">Tìm</button>
        </form>

        <ul class="navbar-nav ms-3">
          <li class="nav-item" v-if="!user">
            <router-link class="nav-link text-white" to="/login">Đăng nhập</router-link>
          </li>
          <li class="nav-item" v-if="!user">
            <router-link class="nav-link text-white" to="/register">Đăng ký</router-link>
          </li>

          <li class="nav-item dropdown" v-if="user">
            <a
              class="nav-link dropdown-toggle text-white"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {{ user.hoTenNV || user.hoTen || 'Tài khoản' }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link class="dropdown-item" :to="profileRoute">Hồ sơ</router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button class="dropdown-item text-danger" @click="logout">Đăng xuất</button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/users'

const q = ref('')
const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)

function onSearch() {
  // simple route to search page (implement page later)
  if (!q.value) return
  router.push({ name: 'TrangChu', query: { q: q.value } })
}

function logout() {
  userStore.logout()
  router.push('/login')
}

const profileRoute = computed(() => {
  // If user is staff, route to admin profile, otherwise reader profile
  if (!user.value) return '/login'
  // crude check for staff: if has msnv or chucVu field
  if (user.value.msnv || user.value.chucVu) return '/admin' // adjust as needed
  return '/profile'
})
</script>

<style scoped>
img {
  border-radius: 5px;
  margin-right: 10px;
}
.app-header {
  background: linear-gradient(90deg, var(--primary-700, #116466), var(--primary-900, #2C3531));
  padding: 0.4rem 1rem;
  color: white;
}
.navbar-brand {
  font-size: 1.05rem;
}
.form-control-sm {
  min-width: 220px;
}
</style>
