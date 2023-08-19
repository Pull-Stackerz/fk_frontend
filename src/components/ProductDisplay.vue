<script lang="ts" setup>
import { ref, computed, PropType } from 'vue';

interface Product {
  link: string;
  thumbnail: string;
  name: string;
  // Add any other properties if necessary.
}

const props = defineProps({
  products: {
    type: Array as PropType<Product[]>,
    required: true,
  },
});

const products = props.products;
const currentIndex = ref(2);

const currentProduct = computed(() => products[currentIndex.value]);

const nextProduct = () => {
  if (currentIndex.value < products.length - 1) {
    currentIndex.value++;
  }
};

const previousProduct = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};
</script>

<template>
  <div class="product-card">
    <a :href="currentProduct.link" target="_blank" rel="noopener noreferrer">
      <div class="product-display">
        <img
          class="product-image"
          :src="currentProduct.thumbnail"
          alt="Product Image"
        />
        <div class="product-name">{{ currentProduct.name }}</div>
      </div>
    </a>
    <div class="navigation-buttons">
      <button
        class="nav-button"
        @click="previousProduct"
        :disabled="currentIndex <= 0"
      >
        Previous
      </button>
      <button
        class="nav-button"
        @click="nextProduct"
        :disabled="currentIndex >= products.length - 1"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  display: inline-block;
  width: 300px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  overflow: hidden;
  background-color: #fff;
  margin: 10px;
  vertical-align: top;
}

.product-display {
  position: relative;
  height: 250px; /* Setting the height for the image part */
  overflow: hidden; /* Hides anything that goes outside the div */
}

.product-image {
  width: 100%;
  height: 100%; /* Makes sure the image takes full height of its parent */
  object-fit: cover; /* Ensures that the image covers the div without getting distorted */
  display: block;
  cursor: pointer;
}

.product-name {
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 3px;
  font-weight: 600;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}

.nav-button {
  background-color: #1976d2;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background-color: #1565c0;
}

.nav-button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}
</style>
