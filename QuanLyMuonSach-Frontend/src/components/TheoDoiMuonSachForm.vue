<template>
  <div class="modal-backdrop">
    <div class="modal d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <form @submit.prevent="onSubmit">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEdit ? "Sửa phiếu mượn" : "Tạo phiếu mượn" }}
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="$emit('close')"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Độc giả</label>
                <select v-model="form.maDocGia" class="form-select" required>
                  <option value="" disabled>-- chọn độc giả --</option>
                  <option
                    v-for="d in docGias"
                    :key="d._id || d.id"
                    :value="d._id || d.id"
                  >
                    {{ d.hoLot ? `${d.hoLot} ${d.ten}` : (d.ten || d.name) }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Sách</label>
                <select v-model="form.maSach" class="form-select" required>
                  <option value="" disabled>-- chọn sách --</option>
                  <option
                    v-for="s in saches"
                    :key="s._id || s.id"
                    :value="s._id || s.id"
                  >
                    {{ s.tenSach || s.ten }}
                  </option>
                </select>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Ngày mượn</label>
                  <input
                    type="datetime-local"
                    v-model="form.ngayMuonLocal"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Ngày dự kiến trả</label>
                  <input
                    type="date"
                    v-model="form.ngayDuKienTraLocal"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Ngày trả (nếu đã trả)</label>
                <input
                  type="datetime-local"
                  v-model="form.ngayTraLocal"
                  class="form-control"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Trạng thái</label>
                <select v-model="form.trangThai" class="form-select" required>
                  <option value="CHỜ DUYỆT">CHỜ DUYỆT</option>
                  <option value="ĐÃ DUYỆT">ĐÃ DUYỆT</option>
                  <option value="ĐANG MƯỢN">ĐANG MƯỢN</option>
                  <option value="ĐÃ TRẢ">ĐÃ TRẢ</option>
                  <option value="HẾT HẠN">HẾT HẠN</option>
                </select>
              </div>

              <div v-if="error" class="alert alert-danger py-1">
                {{ error }}
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('close')"
              >
                Hủy
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span
                  v-if="saving"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, toRefs, watch, computed } from "vue";
  import * as TheoDoiService from "@/services/muonSachService";

  const props = defineProps({
    initial: { type: Object, default: null },
    docGias: { type: Array, default: () => [] },
    saches: { type: Array, default: () => [] },
  });
  const emit = defineEmits(["close", "saved"]);

  const isEdit = computed(() => !!props.initial && !!props.initial._id);

  const form = reactive({
    _id: null,
    maDocGia: "",
    maSach: "",
    ngayMuon: null,
    ngayDuKienTra: null,
    ngayTra: null,
    trangThai: "CHỜ DUYỆT",
    // helper fields for local datetime inputs
    ngayMuonLocal: "",
    ngayDuKienTraLocal: "",
    ngayTraLocal: "",
  });

  const saving = ref(false);
  const error = ref("");

  watch(
    () => props.initial,
    (v) => {
      if (!v) {
        // reset
        Object.assign(form, {
          _id: null,
          maDocGia: "",
          maSach: "",
          ngayMuon: null,
          ngayDuKienTra: null,
          ngayTra: null,
          trangThai: "CHỜ DUYỆT",
          ngayMuonLocal: "",
          ngayDuKienTraLocal: "",
          ngayTraLocal: "",
        });
        error.value = "";
        return;
      }
      // populate from initial
      form._id = v._id;
      form.maDocGia = v.maDocGia?._id || v.maDocGia || "";
      form.maSach = v.maSach?._id || v.maSach || "";
      form.trangThai = v.trangThai || "CHỜ DUYỆT";

      // convert dates to local input-friendly strings
      form.ngayMuonLocal = v.ngayMuon ? toLocalDateTimeInput(v.ngayMuon) : "";
      form.ngayDuKienTraLocal = v.ngayDuKienTra
        ? toLocalDateInput(v.ngayDuKienTra)
        : "";
      form.ngayTraLocal = v.ngayTra ? toLocalDateTimeInput(v.ngayTra) : "";
    },
    { immediate: true }
  );

  function toLocalDateTimeInput(val) {
    try {
      const d = new Date(val);
      // yyyy-mm-ddThh:mm
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  }
  function toLocalDateInput(val) {
    try {
      const d = new Date(val);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
      return "";
    }
  }
  function toIsoFromLocalDateTime(s) {
    if (!s) return null;
    // browser local -> ISO
    const d = new Date(s);
    return d.toISOString();
  }
  function toIsoFromLocalDate(s) {
    if (!s) return null;
    const d = new Date(s + "T00:00:00");
    return d.toISOString();
  }

  async function onSubmit() {
    error.value = "";
    // basic validation
    if (!form.maDocGia) {
      error.value = "Chọn độc giả";
      return;
    }
    if (!form.maSach) {
      error.value = "Chọn sách";
      return;
    }
    if (!form.ngayDuKienTraLocal) {
      error.value = "Chọn ngày dự kiến trả";
      return;
    }

    // prepare payload
    const payload = {
      maDocGia: form.maDocGia,
      maSach: form.maSach,
      ngayMuon:
        toIsoFromLocalDateTime(form.ngayMuonLocal) || new Date().toISOString(),
      ngayDuKienTra: toIsoFromLocalDate(form.ngayDuKienTraLocal),
      ngayTra: toIsoFromLocalDateTime(form.ngayTraLocal),
      trangThai: form.trangThai,
    };

    try {
      saving.value = true;
      let res;
      if (isEdit.value && form._id) {
        res = await TheoDoiService.updateTheoDoi(form._id, payload);
        // res.data or res
        emit("saved", res?.data || res);
      } else {
        res = await TheoDoiService.createTheoDoi(payload);
        emit("saved", res?.data || res);
      }
    } catch (err) {
      console.error("save error", err);
      error.value = err?.response?.data?.message || "Lưu thất bại";
      emit("saved", null);
    } finally {
      saving.value = false;
    }
  }
</script>

<style scoped>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }
  .modal {
    z-index: 1060;
  }
</style>
