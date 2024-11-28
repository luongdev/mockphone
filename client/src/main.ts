import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';

import { registerServices } from './services/injector';

import './style.css'

import App from './App.vue'
import HomeView from './views/Home.vue';
import Register from './views/Register.vue';

const pinia = createPinia();


const routes = [
  { path: '/', component: HomeView },
  { path: '/register', component: Register },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.use(pinia);

registerServices(app);

app.mount('#app')
