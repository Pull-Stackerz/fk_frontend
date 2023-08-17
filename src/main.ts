import { createApp } from 'vue';
import App from './App.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons'; // Importing all solid icons
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import './style.css';

library.add(fas); // Adding all solid icons to the library

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app');
