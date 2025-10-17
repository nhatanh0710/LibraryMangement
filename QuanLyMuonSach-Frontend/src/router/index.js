import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/users";

// ===== Layouts =====
import DocGiaLayout from "@/layouts/DocGia.layout.vue";
import NhanVienLayout from "@/layouts/NhanVien.layout.vue";

// ===== DocGia pages =====
// import TrangChu from "@/pages/DocGia/TrangChu.vue";
// import MuonSach from "@/pages/DocGia/MuonSach.vue";
import RegisterDocGia from "@/pages/auth/RegisterDocGia.vue";

// ===== Auth pages =====
import Login from "@/pages/auth/Login.vue";
import RegisterStaff from "@/pages/auth/RegisterStaff.vue";

// ===== Admin pages =====
import Dashboard from "@/pages/NhanVien/Dashboard.vue";
// import QuanLySach from "@/pages/NhanVien/QuanLySach.vue";
// import QuanLyDocGia from "@/pages/NhanVien/QuanLyDocGia.vue";
// import QuanLyNhanVien from "@/pages/NhanVien/QuanLyNhanVien.vue";
// import QuanLyMuonSach from "@/pages/NhanVien/QuanLyMuonSach.vue";
// import QuanLyNXB from "@/pages/NhanVien/QuanLyNXB.vue";
// import ThongKe from "@/pages/NhanVien/ThongKe.vue";

const routes = [
  // === Trang Login mặc định khi khởi động ===
  { path: "/", redirect: "/login" },

  // // === Độc giả ===
  // {
  //   path: "/docgia",
  //   component: DocGiaLayout,
  //   children: [
  //     { path: "trang-chu", name: "TrangChu", component: TrangChu },
  //     { path: "muon-sach", name: "MuonSach", component: MuonSach },
  //     { path: "register", name: "RegisterDocGia", component: RegisterDocGia },
  //   ],
  // },

  // === Nhân viên (Admin Panel) ===
  {
    path: "/admin",
    component: NhanVienLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "Dashboard", component: Dashboard },
      // { path: "quan-ly-sach", name: "QuanLySach", component: QuanLySach },
      // { path: "quan-ly-docgia", name: "QuanLyDocGia", component: QuanLyDocGia },
      // {
      //   path: "quan-ly-nhanvien",
      //   name: "QuanLyNhanVien",
      //   component: QuanLyNhanVien,
      // },
      // {
      //   path: "quan-ly-muon-sach",
      //   name: "QuanLyMuonSach",
      //   component: QuanLyMuonSach,
      // },
      // { path: "quan-ly-nxb", name: "QuanLyNXB", component: QuanLyNXB },
      // { path: "thong-ke", name: "ThongKe", component: ThongKe },
    ],
  },

  // === Auth ===
  { path: "/login", name: "Login", component: Login },
  { path: "/register-staff", name: "RegisterStaff", component: RegisterStaff },

  // === 404 fallback ===
  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ====== Route Guard (bắt buộc login khi vào /admin) ======
router.beforeEach((to, from, next) => {
  const store = useUserStore();
  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);

  // Nếu cần login mà chưa login -> chuyển đến /login
  if (requiresAuth && !store.isAuthenticated) {
    return next({ name: "Login", query: { redirect: to.fullPath } });
  }

  // Nếu đã login mà cố vào /login -> chuyển về /admin
  if (to.name === "Login" && store.isAuthenticated) {
    return next("/admin");
  }

  next();
});

export default router;
