import api from "@/services/api";

// unwrap payload
const unwrapPayload = (promise) =>
  promise.then((res) => {
    const body = res?.data ?? res;
    return body?.data !== undefined ? body.data : body;
  });

// GET list of books
export const fetchBooks = (params = {}) =>
  unwrapPayload(api.get("/sach", { params }));

// GET single book
export const fetchBook = (id) => unwrapPayload(api.get(`/sach/${id}`));

// CREATE book (JSON or FormData)
export const createBook = (data) => unwrapPayload(api.post("/sach", data));

// UPDATE book
export const updateBook = (id, data) =>
  unwrapPayload(api.put(`/sach/${id}`, data));

// DELETE book
export const deleteBook = (id) => unwrapPayload(api.delete(`/sach/${id}`));
