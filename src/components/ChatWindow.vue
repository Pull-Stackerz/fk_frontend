<template>
  <div
    v-if="showChat"
    :class="['chat-window', { 'full-screen': isFullScreen }]"
  >
    <div class="header">
      <button class="iconz" @click="toggleFullScreen">
        <font-awesome-icon
          :icon="isFullScreen ? ['fas', 'maximize'] : ['fas', 'minimize']"
        />
      </button>
      <button class="iconz" @click="closeChat">
        <font-awesome-icon icon="circle-xmark" />
      </button>
    </div>

    <div class="messages" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', message.owner]"
      >
        <div class="bubble">
          <div v-if="message.type === 'text'">{{ message.content }}</div>
          <img v-if="message.type === 'image'" :src="message.content" />
          <div v-if="message.type === 'buttons'">
            <button
              v-for="button in message.content"
              @click="handleButtonClick(button)"
            >
              {{ button.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isServerTyping" class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="input-container">
      <textarea
        v-model="userInput"
        @keydown.enter.prevent="sendMessage"
        placeholder="Type your message..."
      ></textarea>
      <button
        class="send-button"
        @click="sendMessage"
        v-if="userInput.trim() !== ''"
      >
        <font-awesome-icon icon="paper-plane" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';

interface Message {
  id: number;
  type: string;
  content: string;
  owner: string;
}

const { showChat } = defineProps(['showChat']);
const messagesContainer = ref(null);
const messages = ref<Array<Message>>([]);
const userInput = ref('');
const isFullScreen = ref(false);
const isServerTyping = ref(false);

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
};

const emits = defineEmits(['closeChat']);

const closeChat = () => {
  emits('closeChat');
};

const sendMessage = async () => {
  if (userInput.value.trim() === '') return;

  const userMessage = {
    id: Date.now(),
    type: 'text',
    content: userInput.value,
    owner: 'user',
  };

  messages.value.push(userMessage);
  userInput.value = '';

  scrollToBottom();

  // Show typing indicator
  isServerTyping.value = true;

  const serverReply = await mockServerReply(userMessage.content);

  // Hide typing indicator
  isServerTyping.value = false;

  const serverMessage = {
    id: Date.now() + 1,
    type: 'text',
    content: serverReply,
    owner: 'server',
  };

  messages.value.push(serverMessage);
  scrollToBottom();
};

const handleButtonClick = (button) => {
  // Handle button click, probably sending data to server.
};

const mockServerReply = async (message) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating network delay
  return `Server response to "${message}"`;
};

const scrollToBottom = () => {
  nextTick(() => {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  });
};
</script>

<style>
.chat-window {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 500px;
  height: 600px;
  overflow-y: auto;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  transition: all 0.3s;
  z-index: 100;
}

.chat-window.full-screen {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.header {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  display: inline-flex;
  justify-content: space-between;
}

.iconz {
  font-size: 1.5rem;
  color: #007bff;
  cursor: pointer;
  background-color: transparent;
  border: none;
  outline: none;
}

.messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 10px;
  justify-content: flex-end;
}

.message {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end; /* default alignment for user messages */
  max-width: 70%;
  word-wrap: break-word;
}

.message.user {
  /* background-color: #007bff; Deep blue for user messages */
  color: #ffffff;
  align-self: flex-end;
  border-bottom-right-radius: 0; /* No radius at bottom right for user messages */
}

.message.server {
  /* background-color: #e9e9e9; Light gray for server messages */
  align-self: flex-start;
  color: #000;
  border-bottom-left-radius: 0; /* No radius at bottom left for server messages */
}

.message.user .bubble {
  background-color: #007bff;
  border-radius: 12px 0px 12px 12px;
  padding: 8px 12px;
  margin-right: 8px;
  max-width: 75%;
}

.message.server {
  justify-content: flex-start;
}

.message.server .bubble {
  background-color: #cce5ff;
  border-radius: 0px 12px 12px 12px;
  padding: 8px 12px;
  margin-left: 8px;
  max-width: 75%;
}

.input-container {
  display: flex;
  align-items: center;
  border-top: 1px solid #ccc;
  padding: 10px;
}

textarea {
  flex: 1;
  min-height: 40px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: none; /* Turn off user resize */
  overflow-y: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-right: 10px; /* Space between textarea and send button */
}

.send-button {
  background-color: #007bff;
  color: #ffffff;
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  /* For a bit of hover effect */
}

.send-button:hover {
  background-color: #0056b3;
}

.typing-indicator {
  align-self: flex-start;
  margin-left: 8px;
  margin-bottom: 1rem;
}

.typing-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #888;
  margin: 0 2px;
  animation: bounce 1s infinite;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10px);
  }

  60% {
    transform: translateY(-5px);
  }
}
</style>
