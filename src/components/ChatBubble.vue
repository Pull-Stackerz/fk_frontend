<template>
  <div class="wrapper">
    <div @click="toggleChat" class="chat-icon">
      <font-awesome-icon icon="comment-dots" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const emits = defineEmits(['toggleChat']);

const toggleChat = () => {
  emits('toggleChat');
};
</script>

<style>
.wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 99;
  background-color: #007bff;
  padding: 8px 10px;
  border-radius: 100rem;
  cursor: pointer;
  transition: all 0.3s;
}

.chat-icon {
  font-size: 3rem;
  color: white;
}
</style>
