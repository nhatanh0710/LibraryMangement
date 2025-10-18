import { defineStore } from "pinia";
import api from "@/services/api";

export const useUserStore = defineStore("users", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(account, password) {
      try {
        const res = await api.post("/auth/login", { account, password });
        const data = res.data.data; // **sửa ở đây**
        this.user = { ...data.user, accessToken: data.accessToken };
        localStorage.setItem("user", JSON.stringify(this.user));
      } catch (err) {
        throw err;
      }
    },
    logout() {
      this.user = null;
      localStorage.removeItem("user");
    },
    setUser(u) {
      this.user = u;
      localStorage.setItem("user", JSON.stringify(u));
    },
  },
});
