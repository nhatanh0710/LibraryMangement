<template>
  <div class="about-page">
    <!-- Header Section -->
    <div class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="hero-title">Về NA Library</h1>
            <p class="hero-subtitle">
              Hệ thống quản lý thư viện thông minh - Kết nối tri thức, thuận tiện mọi lúc
            </p>
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-number">5000+</span>
                <span class="stat-label">Đầu sách</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">1000+</span>
                <span class="stat-label">Độc giả</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">99%</span>
                <span class="stat-label">Hài lòng</span>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image">
              <!-- <img src="/images/library-about.jpg" alt="Thư viện NA" class="img-fluid rounded-3" /> -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mission Section -->
    <div class="mission-section py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center">
            <h2 class="section-title mb-4">Sứ mệnh của chúng tôi</h2>
            <p class="mission-text">
              NA Library ra đời với sứ mệnh mang lại trải nghiệm đọc sách và quản lý thư viện tốt nhất 
              cho cộng đồng. Chúng tôi tin rằng tri thức nên được tiếp cận một cách dễ dàng, 
              thuận tiện và hiệu quả thông qua công nghệ hiện đại.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section py-5 bg-light">
      <div class="container">
        <h2 class="section-title text-center mb-5">Tính năng nổi bật</h2>
        <div class="row g-4">
          <div class="col-md-4" v-for="feature in features" :key="feature.title">
            <div class="feature-card">
              <div class="feature-icon-wrapper">
                <i :class="feature.icon"></i>
              </div>
              <h5 class="feature-title">{{ feature.title }}</h5>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Section -->
    <div class="team-section py-5">
      <div class="container">
        <h2 class="section-title text-center mb-5">Đội ngũ phát triển</h2>
        <div class="row g-4 justify-content-center">
          <div class="col-md-6 col-lg-4" v-for="member in team" :key="member.name">
            <div class="team-card">
              <div class="team-avatar">
                <i class="bi bi-person-circle"></i>
              </div>
              <h5 class="team-name">{{ member.name }}</h5>
              <p class="team-role">{{ member.role }}</p>
              <p class="team-bio">{{ member.bio }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Section -->
    <div class="contact-section py-5 bg-primary text-white">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h3 class="contact-title mb-3">Liên hệ với chúng tôi</h3>
            <p class="contact-text mb-0">
              Có câu hỏi hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng giúp đỡ bạn.
            </p>
          </div>
          <div class="col-lg-4 text-lg-end">
            <router-link to="/contact" class="btn btn-light btn-lg">
              <i class="bi bi-envelope me-2"></i>Liên hệ ngay
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const features = ref([
  {
    icon: 'bi bi-search-heart',
    title: 'Tìm kiếm thông minh',
    description: 'Hệ thống tìm kiếm nâng cao giúp bạn nhanh chóng tìm thấy sách mong muốn'
  },
  {
    icon: 'bi bi-calendar-check',
    title: 'Đặt mượn trực tuyến',
    description: 'Đặt mượn sách mọi lúc, mọi nơi qua nền tảng trực tuyến'
  },
  {
    icon: 'bi bi-graph-up',
    title: 'Theo dõi lịch sử',
    description: 'Quản lý toàn bộ lịch sử mượn trả sách chi tiết'
  },
  {
    icon: 'bi bi-bell',
    title: 'Thông báo tự động',
    description: 'Nhận thông báo nhắc nhở hạn trả sách tự động'
  },
  {
    icon: 'bi bi-shield-check',
    title: 'Bảo mật thông tin',
    description: 'Hệ thống bảo mật cao, bảo vệ thông tin cá nhân người dùng'
  },
  {
    icon: 'bi bi-phone',
    title: 'Đa nền tảng',
    description: 'Truy cập trên mọi thiết bị: máy tính, tablet, smartphone'
  }
])

const team = ref([
  {
    name: 'Nguyễn Văn A',
    role: 'Founder & CEO',
    bio: 'Với 10 năm kinh nghiệm trong lĩnh vực công nghệ và thư viện số'
  },
  {
    name: 'Trần Thị B',
    role: 'CTO',
    bio: 'Chuyên gia phát triển hệ thống và công nghệ thông tin'
  },
  {
    name: 'Lê Văn C',
    role: 'Product Manager',
    bio: 'Chịu trách nhiệm thiết kế trải nghiệm người dùng'
  }
])
</script>

<style scoped>
.about-page {
  background-color: var(--background-light);
}

/* Hero Section */
.hero-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--muted-100) 100%);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-900);
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--text-medium);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-700);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.hero-image img {
  box-shadow: var(--shadow-lg);
  transition: transform 0.3s ease;
}

.hero-image img:hover {
  transform: scale(1.02);
}

/* Mission Section */
.mission-section {
  background: var(--surface-white);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--primary-800);
}

.mission-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: var(--text-medium);
  max-width: 800px;
  margin: 0 auto;
}

/* Features Section */
.feature-card {
  background: var(--surface-white);
  padding: 2rem;
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  height: 100%;
  border: 1px solid var(--muted-200);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-300);
}

.feature-icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.feature-icon-wrapper i {
  font-size: 2rem;
  color: white;
}

.feature-title {
  font-weight: 600;
  color: var(--primary-800);
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--text-medium);
  line-height: 1.6;
}

/* Team Section */
.team-card {
  background: var(--surface-white);
  padding: 2rem;
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 1px solid var(--muted-200);
}

.team-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}

.team-avatar {
  width: 100px;
  height: 100px;
  background: var(--muted-200);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.team-avatar i {
  font-size: 3rem;
  color: var(--primary-600);
}

.team-name {
  font-weight: 600;
  color: var(--primary-800);
  margin-bottom: 0.5rem;
}

.team-role {
  color: var(--primary-600);
  font-weight: 500;
  margin-bottom: 1rem;
}

.team-bio {
  color: var(--text-medium);
  line-height: 1.6;
}

/* Contact Section */
.contact-section {
  background: linear-gradient(135deg, var(--primary-700), var(--primary-900));
}

.contact-title {
  font-size: 1.8rem;
  font-weight: 600;
}

.contact-text {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-stats {
    justify-content: center;
    gap: 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .mission-text {
    font-size: 1.1rem;
  }
  
  .feature-card,
  .team-card {
    padding: 1.5rem;
  }
  
  .contact-section .row {
    text-align: center;
  }
}
</style>