<template>
  <Home />
  <!-- <div> -->
  <ChatIcon @toggleChat="toggleChat" />
  <ChatWindow @closeChat="closeChat" :showChat="showChat" />
  <!-- </div> -->
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Home from './pages/Home.vue';
import ChatIcon from './components/ChatBubble.vue';
import ChatWindow from './components/ChatWindow.vue';

const showChat = ref(true);

const closeChat = () => {
  showChat.value = false;
};

const toggleChat = () => {
  showChat.value = !showChat.value;
};
</script>
