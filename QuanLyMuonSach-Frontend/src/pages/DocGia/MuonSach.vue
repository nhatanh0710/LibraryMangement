<!-- src/DocGia/MuonSach.vue -->
<template>
  <div class="container my-4">
    <div class="row">
      <div class="col-lg-6">
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">Mượn sách</h5>

            <!-- Nếu bạn có component form tên TheoDoiMuonSachForm.vue, dùng nó -->
             <TheoDoiMuonSachForm
              role="user"
              :visible="true"
              :initial="null"
              :doc-gias="[]"
              :saches="[]"
              :doc-gias-loading="false"
              :saches-loading="false"
              :user-info="{}"
              @saved="onBorrowSuccess"
              @cancel="() => {}"
            />

          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <BorrowHistory />
      </div>
    </div>
  </div>
</template>

<script setup>
import TheoDoiMuonSachForm from '@/components/MuonSach/TheoDoiMuonSachForm.vue'
import BorrowHistory from '@/components/BorrowHistory.vue'

function onBorrowSuccess(){
  // Emit hoặc refresh history: BorrowHistory có thể tự fetch on mount,
  // nhưng tốt hơn nếu BorrowHistory có method để reload qua event bus hoặc store.
  // Dùng reload tạm: reload page hoặc emit event global. Ở đây tạm reload:
  // (Bạn có thể thay bằng event emitter hoặc store update)
  window.location.reload()
}
</script>
