import api from "@/services/api";

const unwrapPayload = (promise) =>
  promise.then((res) => {
    const body = res?.data || res;
    // Giữ nguyên success, data, meta
    return body && body.success ? body : body;
  });

/** Lấy danh sách sách (hỗ trợ phân trang) */
export const fetchBooks = (page = 1, limit = 10) =>
  unwrapPayload(api.get(`/sach?page=${page}&limit=${limit}`));

export const fetchBook = (id) => unwrapPayload(api.get(`/sach/${id}`));
export const createBook = (payload) =>
  unwrapPayload(api.post("/sach", payload));
export const updateBook = (id, payload) =>
  unwrapPayload(api.put(`/sach/${id}`, payload));
export const deleteBook = (id) => unwrapPayload(api.delete(`/sach/${id}`));
export const searchBooks = (search = "", page = 1, limit = 20) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("limit", limit);
  return unwrapPayload(api.get(`/sach?${params.toString()}`));
};

