<template>
  <header class="app-header navbar navbar-expand-lg">
    <div class="container-fluid">
      <div class="d-flex align-items-center">
        <img src="@/assets/favicon.ico.png" alt="logo" width="40" height="40" class="logo" />
        <router-link class="navbar-brand" to="/">
          NA Library
        </router-link>
      </div>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topNavbar">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="topNavbar">
        <div class="search-wrapper">
          <SearchBar 
            placeholder="Tìm sách, tác giả..."
            size="sm"
            :auto-search="true"
            @search="onSearch"
            @select="onItemSelect"
          />
        </div>

        <ul class="navbar-nav ms-auto">
          <!-- Hiển thị khi chưa đăng nhập -->
          <template v-if="!user">
            <li class="nav-item">
              <router-link class="nav-link" to="/login">
                <i class="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register">
                <i class="bi bi-person-plus me-1"></i>Đăng ký
              </router-link>
            </li>
          </template>

          <!-- Hiển thị khi đã đăng nhập -->
          <template v-else>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" 
                 data-bs-toggle="dropdown" aria-expanded="false">
                <div class="user-info me-2 text-end">
                  <div class="user-name">{{ user.hoLot }} {{ user.ten }}</div>
                  <div class="user-code small opacity-75">{{ user.maDocGia }}</div>
                </div>
                <i class="bi bi-person-circle fs-5"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link class="dropdown-item" :to="profileRoute">
                    <i class="bi bi-person me-2"></i>Thông tin tài khoản
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/docgia/lich-su-muon">
                    <i class="bi bi-clock-history me-2"></i>Lịch sử mượn sách
                  </router-link>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item text-danger" @click="logout">
                    <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                  </button>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/users'
import SearchBar from '@/components/home/SearchBar.vue'

const router = useRouter()
const userStore = useUserStore()

// Lấy thông tin user từ store hoặc localStorage
const user = computed(() => {
  return userStore.user || getLocalUser()
})

// Lấy user từ localStorage
function getLocalUser() {
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
}

function onSearch(searchData) {
  console.log('Tìm kiếm:', searchData)
}

function onItemSelect(item) {
  console.log('Item được chọn:', item)
}

function logout() {
  userStore.logout()
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  router.push('/login')
}

const profileRoute = computed(() => {
  if (!user.value) return '/login'
  // Nếu là admin
  if (user.value.msnv || user.value.chucVu) return '/admin'
  // Nếu là độc giả
  return `/docgia/chi-tiet-doc-gia/${user.value._id || user.value.maDocGia}`
})

// Khởi tạo Bootstrap dropdown
onMounted(() => {
  // Đảm bảo Bootstrap dropdown hoạt động
  const dropdowns = document.querySelectorAll('.dropdown-toggle')
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', function (e) {
      e.preventDefault()
    })
  })
})
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, var(--primary-700), var(--primary-900));
  padding: 0.75rem 1.5rem;
  box-shadow: var(--shadow-lg);
  border-bottom: 3px solid var(--accent-300);
}

.logo {
  border-radius: var(--radius);
  margin-right: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.navbar-brand {
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #ffffff, var(--accent-100));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-brand:hover {
  background: linear-gradient(135deg, var(--accent-100), var(--accent-200));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-wrapper {
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9) !important;
  padding: 0.5rem 1rem !important;
  border-radius: var(--radius);
  font-weight: 500;
  transition: all var(--transition);
  display: flex;
  align-items: center;
}

.nav-link:hover {
  color: white !important;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

/* User info styles */
.user-info {
  line-height: 1.2;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.user-code {
  font-size: 0.75rem;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.8);
}

/* Dropdown styles */
.dropdown-menu {
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, var(--surface-white), #fafbfc);
  border: 1px solid var(--muted-200);
  min-width: 200px;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  transition: all var(--transition);
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
  transform: translateX(4px);
  color: var(--primary-700);
}

.dropdown-item.text-danger:hover {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
}

.navbar-toggler {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
  width: 1.2em;
  height: 1.2em;
}

/* Responsive */
@media (max-width: 768px) {
  .search-wrapper {
    margin: 1rem 0;
    max-width: 100%;
    order: 3;
    width: 100%;
  }
  
  .navbar-collapse {
    flex-direction: column;
  }
  
  .user-info {
    text-align: left !important;
  }
  
  .nav-link.dropdown-toggle {
    justify-content: space-between;
  }
}

@media (max-width: 576px) {
  .app-header {
    padding: 0.5rem 1rem;
  }
  
  .navbar-brand {
    font-size: 1.1rem;
  }
  
  .user-name {
    font-size: 0.8rem;
  }
  
  .user-code {
    font-size: 0.7rem;
  }
}
</style>