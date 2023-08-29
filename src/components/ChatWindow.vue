<template>
  <div
    v-if="showChat"
    :class="['chat-window', { 'full-screen': isFullScreen }]"
  >
    <div class="header">
      <button class="iconz" @click="toggleFullScreen">
        <font-awesome-icon
          :icon="isFullScreen ? ['fas', 'minimize'] : ['fas', 'maximize']"
        />
      </button>
      <h3 class="heading">Generative Ai chat</h3>
      <button class="iconz" @click="closeChat">
        <font-awesome-icon icon="circle-xmark" />
      </button>
    </div>

    <section class="messageBox">
      <div class="messages" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="'message-' + message.id"
          :class="['message', message.owner]"
        >
          <div class="bubble">
            <div v-if="message.type === 'text'">{{ message.content }}</div>
            <img v-if="message.type === 'image'" :src="message.content" />
            <div v-if="message.type === 'buttons'">
              <!-- <button
              v-for="button in message.content"
              @click="handleButtonClick(button)"
            >
              {{ button.label }}
            </button> -->
            </div>
          </div>
        </div>
      </div>
      <section class="product-display">
        <div
          v-for="(details, index) in productDetails"
          :key="'product-' + index"
        >
          <ProductDisplay :products="details" />
        </div>
      </section>
      <div v-if="isServerTyping" class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </section>
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
import { Ref, ref, nextTick } from 'vue';
import ProductDisplay from './ProductDisplay.vue'; // assuming it's in the same directory

interface Message {
  id: number;
  type: string;
  content: any;
  owner: 'user' | 'server';
}

const { showChat } = defineProps(['showChat']);
const messagesContainer: Ref<HTMLElement | null> = ref(null);
const messages = ref<Array<Message>>([
  {
    id: 0,
    type: 'text',
    content: `for better results try to add as much of the following fields possible:
    occasion, region, season, age, gender, ethnicity, body_type, preferred_fabrics
    `,
    owner: 'server',
  },
]);
const userInput = ref<string>('');
const isFullScreen = ref<boolean>(false);
const isServerTyping = ref<boolean>(false);
const productDetails = ref<any[]>([]);

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
};

const emits = defineEmits(['closeChat']);

const closeChat = () => {
  emits('closeChat');
};

const fetchProductDetails = async (productName: string) => {
  try {
    const response = await fetch(
      `https://lazy-rose-squid-gown.cyclic.cloud/search/${productName}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch product details');
    }
    const data = await response.json();
    return data.result;
  } catch (error: any) {
    console.error('Error fetching product details:', error.message);
    return [];
  }
};

// Inside your processServerReply function, make sure to pass the `fetch_from` as well:
const processServerReply = async (reply: any) => {
  const extractProductNames = (reply: any) => {
    const products = [];
    if (reply?.['outfit(top)']) {
      products.push(reply['outfit(top)']);
    } else if (reply?.['outfit']?.['top']) {
      products.push(reply?.['outfit']?.['top']);
    }

    if (reply?.['outfit(bottom)']) {
      products.push(reply?.['outfit(bottom)']);
    } else if (reply?.['outfit']?.['bottom']) {
      products.push(reply?.['outfit']?.['bottom']);
    }

    if (reply.accessories && Array.isArray(reply.accessories)) {
      products.push(...reply.accessories);
    }
    return products;
  };

  const productNames = extractProductNames(reply);
  const allProductDetails = [];

  for (const name of productNames) {
    const details = await fetchProductDetails(name);
    details.fetch_from = `https://lazy-rose-squid-gown.cyclic.cloud/search/${name}`;
    allProductDetails.push(details);
  }

  return allProductDetails;
};

const sendMessage = async () => {
  if (userInput.value.trim() === '') return;

  const userMessage: Message = {
    id: Date.now(),
    type: 'text',
    content: userInput.value,
    owner: 'user',
  };

  messages.value.push(userMessage);
  userInput.value = '';
  scrollToBottom();

  productDetails.value = [];
  isServerTyping.value = true;
  const serverReply = await fetchServerReply(userMessage.content);
  isServerTyping.value = false;

  if (typeof serverReply === 'string') {
    return;
  }

  const serverMessage: Message = {
    id: Date.now() + 1,
    type: 'text',
    content: serverReply.text,
    owner: 'server',
  };

  productDetails.value = serverReply.productDetails;

  messages.value.push(serverMessage);
  scrollToBottom();
};

const fetchServerReply = async (message: string) => {
  try {
    const response = await fetch('https://dull-lion-jersey.cyclic.cloud/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initialInput: message }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch server response');
    }

    const data = await response.json();
    const allProductDetails = await processServerReply(data);

    // console.log('output From ML model:', allProductDetails);
    // console.log('output From LLM model:', data.text);

    return {
      text: data.text, // Using the text property from the new format
      productDetails: allProductDetails,
    };
  } catch (error: any) {
    console.error('Error fetching server reply:', error.message);
    return `Error: ${error.message}`;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};
</script>

<style>
.chat-window {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 700px;
  height: 600px;
  /* overflow-y: auto; */
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
  background-color: #007bff;
  border-radius: 8px 8px 0 0;
}

.heading {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
  color: #fff;
}

.iconz {
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
  background-color: transparent;
  border: none;
  outline: none;
}

.messageBox {
  overflow-y: auto;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  /* align-items: flex-end; */
}

.messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: auto; /* You can adjust this value based on your design needs */
  /* overflow-y: auto; Will show a scrollbar when messages exceed the max-height */
  word-wrap: break-word;
  overflow-wrap: break-word;
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

.product-display {
  display: flex;
  flex-wrap: wrap;
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
