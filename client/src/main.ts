import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';

import { registerServices } from './services/injector';

import './style.css'

import App from './App.vue'
import HomeView from './views/Home.vue';
import Register from './views/Register.vue';
import IncomingCall from './components/IncomingCall.vue';
import OutgoingCall from './components/OutgoingCall.vue';

const pinia = createPinia();

const routes = [
  { path: '/', component: HomeView },
  { path: '/register', component: Register },
  { path: '/incoming', component: IncomingCall },
  { path: '/outgoing', component: OutgoingCall },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

let _mediaStream: MediaStream | null;

export const setMediaStream = (s: MediaStream) => _mediaStream = s;
export const getMediaStream = () => _mediaStream;

const app = createApp(App);
app.use(router);
app.use(pinia);

registerServices(app);

app.mount('#app')
