<template>
    <!-- 📚 Lịch sử mượn -->
      <div class="history-section">
        <BorrowHistory v-if="user?._id || user?.maDocGia" :maDocGia="user._id || user.maDocGia" />
      </div>
</template> 
<script setup>

import { ref, onMounted } from 'vue'
import BorrowHistory from '@/components/BorrowHistory.vue'

const user = ref(null)

onMounted(() => {
  const u = localStorage.getItem('user')
  if (u) user.value = JSON.parse(u)
})

</script>