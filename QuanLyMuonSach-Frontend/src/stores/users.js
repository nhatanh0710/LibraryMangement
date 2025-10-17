// src/stores/users.js
import { defineStore } from "pinia";
import api from "@/services/api";

// store quản lý user (đăng nhập, đăng xuất, thông tin user)
export const useUserStore = defineStore("user", {
  state: () => ({
    // dùng để lưu thông tin user hiện tại
    user: JSON.parse(localStorage.getItem("user")) || null,
  }),
  getters: {
    // kiểm tra đã đăng nhập hay chưa
    isAuthenticated: (s) => !!s.user,
  },
  actions: {
    // lưu thông tin user vào state và localStorage
    setUser(payload) {
      this.user = payload;
      if (payload) localStorage.setItem("user", JSON.stringify(payload));
      else localStorage.removeItem("user");
    },
    logout() {
      this.setUser(null);
    },
    // gọi API đăng nhập
    async login(msnv, password) {
      try {
        const res = await api.post("/nhanvien/login", { msnv, password });
        const data = res.data;
        // xử lý dữ liệu trả về từ API, giả sử trả về user và token
        let userPayload = {};
        if (data.user) {
          userPayload = {
            ...data.user,
            accessToken: data.accessToken || data.token || data.access_token,
          };
        } else {
          //nếu không có trường user, giả sử tất cả data là user info
          userPayload = {
            ...data,
            accessToken: data.accessToken || data.token || data.access_token,
          };
        }
        // lưu user vào state và localStorage
        this.setUser(userPayload);
        return userPayload;
      } catch (err) {
        // rethrow to page so UI can show message
        throw err;
      }
    },
  },
});
