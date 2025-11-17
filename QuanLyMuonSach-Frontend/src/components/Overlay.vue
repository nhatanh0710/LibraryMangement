<template>
  <div v-if="visible" class="overlay">
    <div class="overlay-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false }
});

const emit = defineEmits(['update:visible']);
</script>

<style >
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.overlay-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
  width: 90%;
}
</style>
