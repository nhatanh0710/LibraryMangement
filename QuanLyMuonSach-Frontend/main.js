import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./src/router";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@/styles/styles.css"; // styles global của bạn
import "@/styles/layout.css";
const app = createApp(App);
app.use(createPinia());
app.use(router);
// dev-seed in main.js (only for development)
if (import.meta.env.DEV) {
  try {
    const { useUserStore } = await import("@/stores/users");
    const userStore = useUserStore();
    if (!userStore.user) {
      userStore.setUser({
        _id: "dev-admin-1",
        msnv: "admin",
        hoTenNV: "Admin Dev",
        chucVu: "GIÁM ĐỐC",
        accessToken: "mock-token",
      });
      console.log(
        "[DEV] Seeded mock admin (admin/admin123) - remove before prod"
      );
    }
  } catch (e) {
    console.warn("Seed failed", e);
  }
}

app.mount("#app");
