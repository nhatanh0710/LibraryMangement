import api from "@/services/api";

const unwrapPayload = (promise) =>
  promise.then((res) => {
    const body = res?.data || res;
    // Giữ nguyên success, data, meta
    return body && body.success ? body : body;
  });
/** Lấy danh sách NXB (hỗ trợ phân trang) */
export const fetchNXBs = (page = 1, limit = 10) =>
  unwrapPayload(api.get(`/nxb?page=${page}&limit=${limit}`));

export const fetchNXB = (id) => unwrapPayload(api.get(`/nxb/${id}`));
export const createNXB = (payload) => unwrapPayload(api.post("/nxb", payload));
export const updateNXB = (id, payload) =>
  unwrapPayload(api.put(`/nxb/${id}`, payload));
export const deleteNXB = (id) => unwrapPayload(api.delete(`/nxb/${id}`));
