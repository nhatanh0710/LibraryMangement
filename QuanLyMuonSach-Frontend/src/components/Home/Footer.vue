<!-- src/components/Footer.vue -->
<template>
  <footer class="simple-footer">
    <div class="container">
      <!-- Main Content -->
      <div class="footer-main">
        <!-- Brand & Info -->
        <div class="footer-brand">
          <div class="logo">
            <i class="bi bi-book-half"></i>
            <span>NA Library</span>
          </div>
          <p class="slogan">Hệ thống quản lý thư viện sinh viên</p>
          <div class="contact">
            <div class="contact-item">
              <i class="bi bi-geo-alt"></i>
              <span>123 Đường ABC, TP.HCM</span>
            </div>
            <div class="contact-item">
              <i class="bi bi-envelope"></i>
              <span>lib@university.edu.vn</span>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-links">
          <h6>Liên kết nhanh</h6>
          <router-link to="/" class="link">Trang chủ</router-link>
          <router-link to="/books" class="link">Danh sách sách</router-link>
          <router-link to="/about" class="link">Giới thiệu</router-link>
        </div>

        <!-- Social -->
        <div class="footer-social">
          <h6>Theo dõi chúng tôi</h6>
          <div class="social-icons">
            <a href="#" class="social-link">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="#" class="social-link">
              <i class="bi bi-messenger"></i>
            </a>
            <a href="#" class="social-link">
              <i class="bi bi-envelope"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="copyright">
          © {{ year }} NA Library 
        </div>
        <div class="made-with">
          Made with <i class="bi bi-heart-fill"></i> by Nhat Anh
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const year = ref(new Date().getFullYear())
</script>

<style scoped>
.simple-footer {
  background: #2C3531;
  color: #D1E8E2;
  padding: 2rem 0 1rem;
  margin-top: auto;
}

.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-brand .logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #FFCB9A;
  margin-bottom: 0.5rem;
}

.footer-brand .logo i {
  color: #116466;
  font-size: 1.8rem;
}

.slogan {
  color: #a8d5d6;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.contact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #a8d5d6;
}

.contact-item i {
  color: #116466;
  width: 16px;
}

.footer-links h6,
.footer-social h6 {
  color: #FFCB9A;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link {
  color: #a8d5d6;
  text-decoration: none;
  transition: color 0.3s;
  font-size: 0.9rem;
}

.link:hover {
  color: #FFCB9A;
}

.social-icons {
  display: flex;
  gap: 0.75rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #D1E8E2;
  text-decoration: none;
  transition: all 0.3s;
}

.social-link:hover {
  background: #116466;
  transform: translateY(-2px);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #a8d5d6;
}

.made-with i {
  color: #e74c3c;
  margin: 0 0.25rem;
}

/* Mobile */
@media (max-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }

  .footer-brand .logo {
    justify-content: center;
  }

  .social-icons {
    justify-content: center;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>