<template>
  <div class="container py-3">
    <!-- Header + nút Thêm -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Theo dõi mượn sách</h3>
      <button class="btn btn-primary" @click="openAdd">Thêm phiếu mượn</button>
    </div>

    <!-- Loading spinner -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <!-- Table -->
    <div v-else>
      <table class="table table-striped align-middle" v-if="records.length">
        <thead class="table-dark">
          <tr>
            <th>#</th>
            <th>Độc giả</th>
            <th>Sách</th>
            <th>Ngày mượn</th>
            <th>Ngày dự kiến trả</th>
            <th>Ngày trả</th>
            <th>Trạng thái</th>
            <th class="text-end">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, idx) in records" :key="r._id || idx">
            <td>{{ (page - 1) * limit + idx + 1 }}</td>
            <td>{{ displayDocGia(r.maDocGia) }}</td>
            <td>{{ displaySach(r.maSach) }}</td>
            <td>{{ formatDate(r.ngayMuon) }}</td>
            <td>{{ formatDate(r.ngayDuKienTra) }}</td>
            <td>{{ formatDate(r.ngayTra) }}</td>
            <td>
              <span :class="r.trangThai === 'ĐÃ TRẢ' ? 'text-success' : 'text-warning'">
                {{ r.trangThai }}
              </span>
            </td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-primary me-2" @click="openEdit(r)">Sửa</button>
              <button class="btn btn-sm btn-outline-danger" @click="handleDelete(r)">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="alert alert-info">Không có bản ghi mượn/thông tin nào.</div>

      <!-- Pagination -->
      <Pagination
        v-if="totalPages > 1"
        :page="page"
        :totalPages="totalPages"
        :limit="limit"
        :maxButtons="5"
        @update:page="changePage"
        @update:limit="changeLimit"
        @change="onPageChange"
      />
    </div>

    <!-- Form Overlay -->
     <TheoDoiMuonSachForm
      :role="role"
      :initial="selectedBorrow"
      :doc-gias="docGias"
      :saches="saches"
      :doc-gias-loading="loadingDocGias"
      :saches-loading="loadingSaches"
      :user-info="userInfo"
      :visible="showForm"
      @saved="onSaved"
      @cancel="closeForm"
      @update:visible="showForm = $event"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import TheoDoiMuonSachForm from "@/components/MuonSach/TheoDoiMuonSachForm.vue";
import Pagination from "@/components/Home/Pagination.vue";
import Overlay from "@/components/Overlay.vue";
import loadData from "@/utils/loadData.js";
import * as TheoDoiService from "@/services/muonSachService";
import * as DocGiaService from "@/services/docGiaService";
import * as SachService from "@/services/bookService";

// Table + Pagination
const records = ref([]);
const loading = ref(false);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const totalPages = ref(0);

// Overlay / Form
const showForm = ref(false);
const selectedBorrow = ref(null);
const role = ref("admin"); // ví dụ admin, có thể lấy từ userInfo

// Lookup lists cho selects
const docGias = ref([]);
const saches = ref([]);
const loadingDocGias = ref(false);
const loadingSaches = ref(false);
const userInfo = ref({}); // thông tin user

// --- Load dữ liệu ---
async function loadTheoDoi(p = 1) {
  try {
    await loadData(TheoDoiService.fetchMuonSachs, records, p, limit.value, {
      loading, total, totalPages
    });
  } catch (err) {
    console.error("loadTheoDoi error:", err);
    records.value = [];
    total.value = 0;
    totalPages.value = 0;
    page.value = 1;
  }
}

// Load lookup lists
async function loadLookups() {
  try {
    loadingDocGias.value = true;
    loadingSaches.value = true;
    const [dgRes, sachRes] = await Promise.all([
      DocGiaService.fetchDocGias(1, 50),
      SachService.fetchBooks(1, 50)
    ]);
    docGias.value = dgRes?.data || dgRes || [];
    saches.value = sachRes?.data || sachRes || [];
  } catch (err) {
    console.warn("loadLookups failed", err);
    docGias.value = [];
    saches.value = [];
  } finally {
    loadingDocGias.value = false;
    loadingSaches.value = false;
  }
}

// --- Form open/close ---
function openAdd() {
  selectedBorrow.value = null;
  showForm.value = true;
   
}
function openEdit(r) {
  selectedBorrow.value = r;
  showForm.value = true;
}
function closeForm() {
  showForm.value = false;
  selectedBorrow.value = null;
}

// --- Handle saved ---
function onSaved(saved) {
  if (saved) {
    const idx = records.value.findIndex(x => x._id === saved._id);
    if (idx !== -1) records.value.splice(idx, 1, saved);
    else records.value.unshift(saved);
    if (records.value.length > limit.value) records.value.splice(limit.value);
  }
  closeForm();
}

// --- Delete handler ---
async function handleDelete(r) {
  if (!r?._id) return alert("Bản ghi không hợp lệ");
  if (!confirm(`Bạn có chắc muốn xóa phiếu mượn của độc giả "${displayDocGia(r.maDocGia)}"?`)) return;
  try {
    loading.value = true;
    await TheoDoiService.deleteTheoDoi(r._id);
    await loadTheoDoi(page.value);
    alert("Xóa thành công");
  } catch (err) {
    console.error("Xóa lỗi:", err);
    alert(err?.response?.data?.message || "Xóa thất bại");
  } finally {
    loading.value = false;
  }
}

// --- Helpers hiển thị ---
function formatDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
function displayDocGia(maDocGia) {
  if (!maDocGia) return "";
  if (typeof maDocGia === "object") return maDocGia.hoLot ? `${maDocGia.hoLot} ${maDocGia.ten}` : maDocGia.ten || maDocGia._id;
  const found = docGias.value.find(d => d._id === maDocGia || d.id === maDocGia || d.maDocGia === maDocGia);
  return found ? (found.hoLot ? `${found.hoLot} ${found.ten}` : found.ten || found.name) : maDocGia;
}
function displaySach(maSach) {
  if (!maSach) return "";
  if (typeof maSach === "object") return maSach.tenSach || maSach.ten || maSach._id;
  const found = saches.value.find(s => s._id === maSach || s.id === maSach || s.maSach === maSach);
  return found ? (found.tenSach || found.ten) : maSach;
}

// --- Pagination ---
function changePage(p) {
  const np = Number(p) || 1;
  if (np === page.value) return;
  page.value = np;
  loadTheoDoi(page.value);
}
function changeLimit(l) {
  const nl = Number(l) || 10;
  if (nl === limit.value) return;
  limit.value = nl;
  page.value = 1;
  loadTheoDoi(page.value);
}
function onPageChange({ page: p, limit: l } = {}) {
  if (p) changePage(p);
  if (l) changeLimit(l);
}

// --- Mount ---
onMounted(async () => {
  await loadLookups();
  loadTheoDoi(1);
});
</script>

<style scoped>
.container { max-width: 1100px; }
.table td, .table th { vertical-align: middle; }
</style>
