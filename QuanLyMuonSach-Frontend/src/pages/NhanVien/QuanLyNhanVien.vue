<template>
  <div class="container py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Quản lý nhân viên</h3>
      <div>
        <button class="btn btn-primary me-2" @click="openAdd">Thêm nhân viên</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-else>
      <table class="table table-striped align-middle" v-if="nhanViens.length">
        <thead class="table-dark">
          <tr>
            <th style="width:48px">#</th>
            <th>Mã</th>
            <th>Họ tên</th>
            <th>Chức vụ</th>
            <th>Điện thoại</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th class="text-end">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(nv, idx) in nhanViens" :key="nv._id || nv.msnv || idx">
            <td>{{ (page - 1) * limit + idx + 1 }}</td>
            <td>{{ nv.msnv }}</td>
            <td>{{ nv.hoTenNV }}</td>
            <td>{{ nv.chucVu }}</td>
            <td>{{ nv.soDienThoai }}</td>
            <td>
              <span :class="nv.trangThai === 'ACTIVE' ? 'text-success' : 'text-danger'">
                {{ nv.trangThai }}
              </span>
            </td>
            <td>{{ formatDate(nv.createdAt) }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-accent me-2" @click="openEdit(nv)">Sửa</button>
              <button class="btn btn-sm btn-danger" @click="handleDelete(nv)">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="alert alert-info">Không có nhân viên nào.</div>

      <!-- Dùng Pagination component bạn gửi -->
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

    <!-- Form Modal -->
    <NhanVienForm
      v-if="showForm"
      :initial="selected"
      @close="closeForm"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import NhanVienForm from "@/components/NhanVienForm.vue";
import Pagination from "@/components/Home/Pagination.vue";
import loadData from "@/utils/loadData.js";
import * as NhanVienService from "@/services/nhanVienService";

// State refs (loadData sẽ cập nhật các biến này theo implementation bạn đã gửi)
const nhanViens = ref([]);
const loading = ref(false);
const showForm = ref(false);
const selected = ref(null);

const page = ref(1);
const limit = ref(10);
const total = ref(0);
const totalPages = ref(0);

/**
 * loadNhanViens sử dụng chính xác loadData bạn đã cung cấp.
 * loadData(serviceFunc, targetList, p, limit) — và sẽ cập nhật loading/page/limit/total/totalPages
 */
async function loadNhanViens(p = 1) {
  try {
    // đảm bảo giá trị limit hiện tại được truyền
    await loadData(NhanVienService.fetchNhanViens, nhanViens, p, limit.value, {
  loading, total, totalPages
});
  } catch (err) {
    console.error("loadNhanViens error:", err);
    // reset minimal
    nhanViens.value = [];
    total.value = 0;
    totalPages.value = 0;
    page.value = 1;
  }
}

function openAdd() {
  selected.value = null;
  showForm.value = true;
}

function openEdit(nv) {
  selected.value = nv;
  showForm.value = true;
}

function closeForm() {
  selected.value = null;
  showForm.value = false;
}

async function onSaved(saved) {
  if (!saved) {
    closeForm();
    return;
  }

  // server của bạn đã unwrap -> saved là object nhân viên
  const idx = nhanViens.value.findIndex((x) => x._id === saved._id);
  if (idx !== -1) nhanViens.value.splice(idx, 1, saved);
  else nhanViens.value.unshift(saved);

  // giữ độ dài không vượt limit
  if (nhanViens.value.length > limit.value) nhanViens.value.splice(limit.value);
  
  closeForm();
  await loadNhanViens(page.value);
}

async function handleDelete(nv) {
  if (!nv || !nv._id) {
    alert("Nhân viên không hợp lệ");
    return;
  }
  if (!confirm(`Bạn có chắc muốn xóa nhân viên "${nv.hoTenNV}"?`)) return;
  try {
    loading.value = true;
    await NhanVienService.deleteNhanVien(nv._id);
    // reload trang hiện tại để đồng bộ pagination
    await loadNhanViens(page.value);
    alert("Xóa thành công");
  } catch (err) {
    console.error("Xóa lỗi:", err);
    alert(err?.response?.data?.message || "Xóa thất bại");
  } finally {
    loading.value = false;
  }
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function changePage(p) {
  const np = Number(p) || 1;
  if (np === page.value) return;
  page.value = np;
  loadNhanViens(page.value);
}

function changeLimit(l) {
  const nl = Number(l) || 10;
  if (nl === limit.value) return;
  limit.value = nl;
  page.value = 1;
  loadNhanViens(page.value);
}

function onPageChange({ page: p, limit: l } = {}) {
  if (p) changePage(p);
  if (l) changeLimit(l);
}

onMounted(() => {
  loadNhanViens(1);
});
</script>

<style scoped>
.container { max-width: 1100px; }
.table td, .table th { vertical-align: middle; }
</style>
