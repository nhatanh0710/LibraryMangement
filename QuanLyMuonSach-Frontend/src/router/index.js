import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/users";

// ===== Layouts =====
import DocGiaLayout from "@/layouts/DocGia.layout.vue";
import NhanVienLayout from "@/layouts/NhanVien.layout.vue";

// ===== DocGia pages =====
import TrangChu from "@/pages/DocGia/TrangChu.vue";
import MuonSach from "@/pages/DocGia/MuonSach.vue";
import ChiTietDocGia from "../pages/DocGia/ChiTietDocGia.vue";
import ChiTietSach from "../pages/DocGia/ChiTietSach.vue";
import RegisterDocGia from "@/pages/auth/RegisterDocGia.vue";
import About from "@/pages/DocGia/About.vue";

// ===== Auth pages =====
import Login from "@/pages/auth/Login.vue";
import Register from "@/pages/auth/RegisterDocGia.vue";

// ===== Admin pages =====
import Dashboard from "@/pages/NhanVien/Dashboard.vue";
import QuanLySach from "@/pages/NhanVien/QuanLySach.vue";
import QuanLyDocGia from "@/pages/NhanVien/QuanLyDocGia.vue";
import QuanLyNhanVien from "@/pages/NhanVien/QuanLyNhanVien.vue";
import QuanLyMuonSach from "@/pages/NhanVien/QuanLyMuonSach.vue";
import QuanLyNXB from "@/pages/NhanVien/QuanLyNXB.vue";
import ChiTietNhanVien from "@/pages/NhanVien/ChiTietNhanVien.vue";
// import ThongKe from "@/pages/NhanVien/ThongKe.vue";

const routes = [
  // === Trang Login mặc định khi khởi động ===
  { path: "/", redirect: "/docgia/trang-chu" },

  // === Độc giả ===
  {
    path: "/docgia",
    component: DocGiaLayout,
    children: [
      { path: "trang-chu", name: "TrangChu", component: TrangChu },
      { path: "muon-sach", name: "MuonSach", component: MuonSach },
      {
        path: "chi-tiet-doc-gia/:id",
        name: "ChiTietDocGia",
        component: ChiTietDocGia,
        props: true,
      },
      {
        path: "chi-tiet-sach/:id",
        name: "ChiTietSach",
        component: ChiTietSach,
        props: (route) => ({
          id: route.params.id,
          maSach: route.query.maSach, // hỗ trợ cả query param
        }),
      },
      {path: "about",
        name: "About",
        component: About,
      },
      { path: "register", name: "RegisterDocGia", component: RegisterDocGia },
    ],
  },

  // === Nhân viên (Admin Panel) ===
  {
    path: "/admin",
    component: NhanVienLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "Dashboard", component: Dashboard },
      { path: "quan-ly-sach", name: "QuanLySach", component: QuanLySach },
      { path: "quan-ly-docgia", name: "QuanLyDocGia", component: QuanLyDocGia },
      {
        path: "quan-ly-nhanvien",
        name: "QuanLyNhanVien",
        component: QuanLyNhanVien,
      },
      {
        path: "quan-ly-muon-sach",
        name: "QuanLyMuonSach",
        component: QuanLyMuonSach,
      },
      { path: "quan-ly-nxb", name: "QuanLyNXB", component: QuanLyNXB },
      {
        path: "chi-tiet-nhan-vien/:id",
        name: "ChiTietNhanVien",
        component: ChiTietNhanVien,
        props: true,
      },
      // { path: "thong-ke", name: "ThongKe", component: ThongKe },
    ],
  },

  // === Auth ===
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },

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

  // not authenticated -> go to login (preserve redirect)
  if (requiresAuth && !store.isAuthenticated) {
    return next({ name: "Login", query: { redirect: to.fullPath } });
  }

  // already logged in and trying to visit /login -> redirect to proper home
  if (to.name === "Login" && store.isAuthenticated) {
    // choose destination based on user type
    const dest = store.user?.type === "DOCGIA" ? "/docgia/trang-chu" : "/admin";
    return next(dest);
  }

  // protect admin routes: if route under /admin and user is DOCGIA -> redirect
  if (to.path.startsWith("/admin") && store.isAuthenticated) {
    if (store.user?.type === "DOCGIA") {
      return next("/docgia/trang-chu");
    }
  }

  next();
});


export default router;
