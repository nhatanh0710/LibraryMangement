<!-- Input chọn ngày mượn/trả trong form mượn sách -->
<template>
  <div class="row">

    <!-- NGÀY MƯỢN -->
    <div class="col-md-4 mb-3">
      <label class="form-label">Ngày mượn</label>

      <!-- User: chỉ xem, không được chỉnh -->
      <input 
        v-if="isUser" 
        class="form-control bg-light" 
        type="datetime-local" 
        :value="ngayMuonLocal"
        disabled
      />

      <!-- Admin: được chỉnh -->
      <input 
        v-else 
        class="form-control"
        type="datetime-local"
        v-model="ngayMuonLocal"
      />
    </div>

    <!-- NGÀY DỰ KIẾN TRẢ (ai cũng chỉnh được) -->
    <div class="col-md-4 mb-3">
      <label class="form-label">Ngày dự kiến trả</label>
      <input 
        class="form-control"
        type="date"
        v-model="ngayDuKienTraLocal"
      />
    </div>

    <!-- NGÀY TRẢ (chỉ admin thấy + chỉnh) -->
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
  role: String,       // admin hoặc user
  isEdit: Boolean,    // đang chỉnh sửa hay không
  initial: Object,    // dữ liệu ban đầu khi edit
});

const emit = defineEmits(["update"]);

const isAdmin = computed(() => props.role === "admin");
const isUser = computed(() => props.role === "user");

// Giá trị local để bind vào input
const ngayMuonLocal = ref("");
const ngayDuKienTraLocal = ref("");
const ngayTraLocal = ref("");

// Chuyển ISO → local input format
function toLocalDateTime(val) {
  if (!val) return "";
  return new Date(val).toISOString().slice(0, 16);
}
function toLocalDate(val) {
  if (!val) return "";
  return new Date(val).toISOString().slice(0, 10);
}

// Chuyển input format → ISO để gửi backend
function toISO(s) {
  return s ? new Date(s).toISOString() : null;
}

// Khi edit → load lại dữ liệu ban đầu
watch(() => props.initial, (v) => {
  if (!v) {
    if (isUser.value) {
      ngayMuonLocal.value = new Date().toISOString().slice(0,16); // mặc định ngày hiện tại
    } else {
      ngayMuonLocal.value = '';
    }
    ngayDuKienTraLocal.value = '';
    ngayTraLocal.value = '';
    return;
  }
  ngayMuonLocal.value = toLocalDateTime(v.ngayMuon);
  ngayDuKienTraLocal.value = toLocalDate(v.ngayDuKienTra);
  ngayTraLocal.value = toLocalDateTime(v.ngayTra);
}, { immediate: true });


// Mỗi lần input thay đổi → emit object chứa ISO date
watch(
  [ngayMuonLocal, ngayDuKienTraLocal, ngayTraLocal],
  () => {
    emit("update", {
      ngayMuon: toISO(ngayMuonLocal.value),
      ngayDuKienTra: toISO(ngayDuKienTraLocal.value),
      ngayTra: toISO(ngayTraLocal.value),
    });
  }
);
</script>
