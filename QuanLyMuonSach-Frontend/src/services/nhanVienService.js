import api from "@/services/api";

const unwrapPayload = (promise) =>
  promise.then((res) => {
    const body = res?.data || res;
    // Giữ nguyên success, data, meta
    return body && body.success ? body : body;
  });

/** Lấy danh sách nhân viên (hỗ trợ phân trang) */
export const fetchNhanViens = (page = 1, limit = 10) =>
  unwrapPayload(api.get(`/nhanvien?page=${page}&limit=${limit}`));

export const fetchNhanVien = (id) => unwrapPayload(api.get(`/nhanvien/${id}`));
export const createNhanVien = (payload) =>
  unwrapPayload(api.post("/nhanvien", payload));
export const updateNhanVien = (id, payload) =>
  unwrapPayload(api.put(`/nhanvien/${id}`, payload));
export const deleteNhanVien = (id) =>
  unwrapPayload(api.delete(`/nhanvien/${id}`));
