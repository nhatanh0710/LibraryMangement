<template>
  <div class="rules-container">
    <!-- Header -->
    <div class="rules-header">
      <div class="icon-wrapper">
        <span class="icon">📚</span>
      </div>
      <h1>Nội quy & Quy định mượn sách</h1>
      <p class="subtitle">Quy định áp dụng cho tất cả độc giả của thư viện</p>
    </div>

    <!-- Rules Grid -->
    <div class="rules-grid">
      <!-- Card 1: Nội quy chung -->
      <div class="rule-card">
        <div class="card-header">
          <div class="card-icon">🏛️</div>
          <h3>Nội quy chung</h3>
        </div>
        <ul class="rule-list">
          <li><span class="bullet">•</span> Thư viện mở cửa từ <strong>8:00 - 18:00</strong> hàng ngày</li>
          <li><span class="bullet">•</span> Đăng ký tài khoản trước khi mượn sách</li>
          <li><span class="bullet">•</span> Giữ gìn sách và trật tự thư viện</li>
          <li><span class="bullet">•</span> Không ăn uống trong khu vực đọc sách</li>
        </ul>
      </div>

      <!-- Card 2: Quy định mượn sách -->
      <div class="rule-card">
        <div class="card-header">
          <div class="card-icon">📖</div>
          <h3>Quy định mượn sách</h3>
        </div>
        <ul class="rule-list">
          <li><span class="bullet">•</span> Tối đa <strong>5 cuốn</strong> mượn cùng lúc</li>
          <li><span class="bullet">•</span> Thời gian mượn: <strong>14 ngày</strong></li>
          <li><span class="bullet">•</span> Gia hạn tối đa <strong>2 lần</strong></li>
          <li><span class="bullet">•</span> Xuất trình mã độc giả khi mượn/trả</li>
        </ul>
      </div>

      <!-- Card 3: Phạt trễ hạn -->
      <div class="rule-card highlight">
        <div class="card-header">
          <div class="card-icon">⚠️</div>
          <h3>Phạt trễ hạn</h3>
        </div>
        <ul class="rule-list">
          <li><span class="bullet">•</span> Phạt <strong>2.000 VNĐ/ngày/sách</strong> khi trả trễ</li>
          <li><span class="bullet">•</span> Bồi thường 100% nếu sách bị mất</li>
          <li><span class="bullet">•</span> Tự động đánh dấu <strong>"TRẢ TRỄ"</strong></li>
          <li><span class="bullet">•</span> Khóa tài khoản nếu trễ quá 30 ngày</li>
        </ul>
      </div>

      <!-- Card 4: Lưu ý quan trọng -->
      <div class="rule-card full-width">
        <div class="card-header">
          <div class="card-icon">💡</div>
          <h3>Lưu ý quan trọng</h3>
        </div>
        <div class="notice-content">
          <p>• Kiểm tra sách trước khi mượn, báo ngay nếu có hư hỏng</p>
          <p>• Tuân thủ nội quy để đảm bảo trải nghiệm cho tất cả độc giả</p>
          <p>• Thông tin chi tiết xin liên hệ quầy thư viện</p>
        </div>
        <div class="contact-info">
          <span>📞 Hotline: 1900 1234</span>
          <span>📧 Email: support@thuvien.edu.vn</span>
        </div>
      </div>
    </div>

    
  </div>
</template>

<script setup>
</script>

<style scoped>
.rules-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.rules-header {
  text-align: center;
  margin-bottom: 50px;
}

.icon-wrapper {
  margin-bottom: 20px;
}

.icon {
  font-size: 60px;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

h1 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 700;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.rule-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid #eef2f7;
  transition: transform 0.3s, box-shadow 0.3s;
}

.rule-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.rule-card.highlight {
  border: 2px solid #ff6b6b;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
}

.rule-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f4f8;
}

.card-icon {
  font-size: 28px;
}

h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rule-list li {
  padding: 10px 0;
  color: #4a5568;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-bottom: 1px solid #f7f9fc;
}

.rule-list li:last-child {
  border-bottom: none;
}

.bullet {
  color: #4299e1;
  font-size: 20px;
  flex-shrink: 0;
}

.notice-content {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.notice-content p {
  padding: 8px 0;
  color: #4a5568;
}

.contact-info {
  display: flex;
  justify-content: space-around;
  background: #e6fffa;
  padding: 15px;
  border-radius: 12px;
  color: #2c7a7b;
  font-weight: 500;
}

.rules-footer {
  text-align: center;
  padding: 30px;
  background: #f8fafc;
  border-radius: 16px;
  margin-top: 30px;
}

.rules-footer p {
  color: #4a5568;
  margin-bottom: 20px;
  font-size: 16px;
}

.agree-btn {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.agree-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 153, 225, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .rules-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-info {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  h1 {
    font-size: 28px;
  }
}
</style>