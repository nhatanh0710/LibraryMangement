import api from "@/services/api";

const unwrapPayload = (promise) =>
  promise.then((res) => {
    const body = res?.data || res;
    return body && body.success ? body : body;
  });

/** Lấy danh sách theo dõi mượn sách (hỗ trợ phân trang) */
export const fetchMuonSachs = (page = 1, limit = 10) =>
  unwrapPayload(api.get(`/theodoimuonsach?page=${page}&limit=${limit}`));

/** Lấy chi tiết một phiếu mượn */
export const fetchMuonSach = (id) => unwrapPayload(api.get(`/theodoimuonsach/${id}`));

/** Tạo mới phiếu mượn */
export const createMuonSach = (payload) =>
  unwrapPayload(api.post("/theodoimuonsach", payload));

/** Cập nhật phiếu mượn */
export const updateMuonSach = (id, payload) =>
  unwrapPayload(api.put(`/theodoimuonsach/${id}`, payload));

/** Xóa phiếu mượn */
export const deleteMuonSach = (id) =>
  unwrapPayload(api.delete(`/theodoimuonsach/${id}`));
