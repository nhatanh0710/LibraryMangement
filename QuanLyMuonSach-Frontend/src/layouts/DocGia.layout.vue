<template>
  <div class="docgia-layout d-flex flex-column min-vh-100">
     <header class="sticky-top shadow-sm bg-white z-3">
      <Header />
    </header>

    <main class="container py-4">
      <router-view />
    </main>

    <div> 
      <Footer />
    </div>
    </div>
</template>

<script setup>
import Header from '@/components/Home/Header.vue'
import Footer from '@/components/Home/Footer.vue'
</script>

<style scoped>
.container { max-width: 1100px; }
</style>
