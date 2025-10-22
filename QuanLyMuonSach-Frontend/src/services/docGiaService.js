import api from "@/services/api";

const unwrapPayload = (promise) =>
  promise.then((res) => {
    const body = res?.data || res;
    // Giữ nguyên success, data, meta
    return body && body.success ? body : body;
  });

/** Lấy danh sách độc giả (hỗ trợ phân trang) */
export const fetchDocGias = (page = 1, limit = 10) =>
  unwrapPayload(api.get(`/docgia?page=${page}&limit=${limit}`));

export const fetchDocGia = (id) => unwrapPayload(api.get(`/docgia/${id}`));
export const createDocGia = (payload) =>
  unwrapPayload(api.post("/docgia", payload));
export const updateDocGia = (id, payload) =>
  unwrapPayload(api.put(`/docgia/${id}`, payload));
export const deleteDocGia = (id) => unwrapPayload(api.delete(`/docgia/${id}`));
// search server-side theo param 'search'
export const searchDocGias = (search = "", page = 1, limit = 20) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("limit", limit);
  return unwrapPayload(api.get(`/docgia?${params.toString()}`));
};
