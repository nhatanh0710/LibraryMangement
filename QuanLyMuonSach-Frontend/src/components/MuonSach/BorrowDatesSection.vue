<template>
  <div class="row">
    <!-- NGÀY MƯỢN -->
    <div class="col-md-4 mb-3">
      <label class="form-label">Ngày mượn</label>

      <!-- USER: không được chỉnh -->
      <input 
        v-if="isUser" 
        class="form-control bg-light" 
        type="datetime-local" 
        :value="ngayMuonLocal"
        disabled
      />

      <!-- ADMIN -->
      <input 
        v-else 
        class="form-control"
        type="datetime-local"
        v-model="ngayMuonLocal"
      />
    </div>

    <!-- NGÀY DỰ KIẾN TRẢ -->
    <div class="col-md-4 mb-3">
      <label class="form-label">Ngày dự kiến trả</label>
      <input 
        class="form-control"
        type="date"
        v-model="ngayDuKienTraLocal"
      />
    </div>

    <!-- NGÀY TRẢ (user không thấy) -->
    <div class="col-md-4 mb-3" v-if="isAdmin">
      <label class="form-label">Ngày trả</label>
      <input
        class="form-control"
        type="datetime-local"
        v-model="ngayTraLocal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  role: String,
  isEdit: Boolean,
  initial: Object,
});

const emit = defineEmits(["update"]);

const isAdmin = computed(() => props.role === "admin");
const isUser = computed(() => props.role === "user");

// LOCAL MODEL
const ngayMuonLocal = ref("");
const ngayDuKienTraLocal = ref("");
const ngayTraLocal = ref("");

// Convert helpers
function toLocalDateTime(val) {
  if (!val) return "";
  const d = new Date(val);
  return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
}
function toLocalDate(val) {
  if (!val) return "";
  const d = new Date(val);
  return d.toISOString().slice(0, 10); // yyyy-MM-dd
}
function toISO(s) {
  return s ? new Date(s).toISOString() : null;
}

// Load khi edit
watch(
  () => props.initial,
  (v) => {
    if (!v) return;

    ngayMuonLocal.value = toLocalDateTime(v.ngayMuon);
    ngayDuKienTraLocal.value = toLocalDate(v.ngayDuKienTra);
    ngayTraLocal.value = toLocalDateTime(v.ngayTra);
  },
  { immediate: true }
);

// Emit mỗi khi thay đổi
watch([ngayMuonLocal, ngayDuKienTraLocal, ngayTraLocal], () => {
  emit("update", {
    ngayMuon: toISO(ngayMuonLocal.value),
    ngayDuKienTra: toISO(ngayDuKienTraLocal.value),
    ngayTra: toISO(ngayTraLocal.value),
  });
});
</script>
