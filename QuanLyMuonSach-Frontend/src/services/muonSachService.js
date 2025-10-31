import api from "@/services/api";

const unwrapPayload = (promise) =>
  promise.then((res) => {
    const body = res?.data || res;
    return body && body.success ? body : body;
  });

/** Lấy danh sách theo dõi mượn sách (hỗ trợ phân trang) */
export const fetchMuonSachs = (page = 1, limit = 10) =>
  unwrapPayload(api.get(`/theodoimuonsach?page=${page}&limit=${limit}`));

export const fetchMuonSachTheoDocGia = (page = 1, limit = 10, filters = {}) => {
  const params = { page, limit, ...filters }; // filters can include maDocGia, search
  return api.get("/theodoimuonsach", { params });
};
/** Lấy chi tiết một phiếu mượn */
export const fetchMuonSach = (id) =>
  unwrapPayload(api.get(`/theodoimuonsach/${id}`));

/** Tạo mới phiếu mượn */
export const createMuonSach = (payload) =>
  unwrapPayload(api.post("/theodoimuonsach", payload));

/** Cập nhật phiếu mượn */
export const updateMuonSach = (id, payload) =>
  unwrapPayload(api.put(`/theodoimuonsach/${id}`, payload));

/** Xóa phiếu mượn */
export const deleteMuonSach = (id) =>
  unwrapPayload(api.delete(`/theodoimuonsach/${id}`));

export const fetchTheoDoi = fetchMuonSachs;
export const fetchTheoDoiById = fetchMuonSach;
export const createTheoDoi = createMuonSach;
export const updateTheoDoi = updateMuonSach;
export const deleteTheoDoi = deleteMuonSach;
