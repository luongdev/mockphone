import { defineStore } from 'pinia';


export const useAgentStore = defineStore('agent', {
  state: () => {

    return {
      registered: false,
      extension: '',
      domain: '',
      password: '',
      proxy: '',
    };
  },
  actions: {
    register() {

    },
  }
});