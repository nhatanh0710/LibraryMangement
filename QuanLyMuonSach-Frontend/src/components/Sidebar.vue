<template>
  <aside class="app-sidebar bg-light border-end">
    <div>
        <div class="fw-bold">Admin Panel</div>
        <small class="text-muted">Quản lý thư viện NA Library</small>
      </div>
    <nav class="nav flex-column px-2">
      <router-link class="nav-link d-flex align-items-center" to="/admin">
        <span class="me-2">🏠</span> Dashboard
      </router-link>

      <router-link class="nav-link d-flex align-items-center" to="/admin/quan-ly-sach">
        <span class="me-2">📚</span> Quản lý sách
      </router-link>

      <router-link class="nav-link d-flex align-items-center" to="/admin/quan-ly-docgia">
        <span class="me-2">🧑‍🤝‍🧑</span> Quản lý độc giả
      </router-link>

      <router-link class="nav-link d-flex align-items-center" to="/admin/quan-ly-nhanvien">
        <span class="me-2">👩‍💼</span> Quản lý nhân viên
      </router-link>

      <router-link class="nav-link d-flex align-items-center" to="/admin/quan-ly-muon-sach">
        <span class="me-2">📝</span> Quản lý mượn trả
      </router-link>

      <router-link class="nav-link d-flex align-items-center" to="/admin/quan-ly-nxb">
        <span class="me-2">🏷️</span> Quản lý NXB
      </router-link>

      <div class="mt-3 px-2">
        <small class="text-muted">Tiện ích</small>
      </div>

      <router-link class="nav-link d-flex align-items-center" to="/admin/thong-ke">
        <span class="me-2">📈</span> Thống kê
      </router-link>
    </nav>

    <div class="sidebar-footer mt-auto p-3">
      <small class="text-muted">Phiên bản 1.0</small>
    </div>
  </aside>
</template>

<script setup>
// currently static links; if you want role-based links, import store and compute here.
</script>

<style scoped>
.app-sidebar{
  width: 220px;
  min-width: 220px;
  height: calc(100vh - 56px); /* minus header height */
  display: flex;
  flex-direction: column;
  background: #fff;
}
.sidebar-top {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.nav-link {
  color: #333;
  padding: 0.65rem 0.75rem;
}
.nav-link:hover {
  background: rgba(0,0,0,0.03);
  border-radius: 6px;
}
.sidebar-footer {
  border-top: 1px solid rgba(0,0,0,0.05);
}
</style>
