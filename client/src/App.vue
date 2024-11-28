<script setup lang="ts">

import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAgentStore } from './store/store';

import EmptyLayout from './layouts/EmptyLayout.vue';

const router = useRouter();
const agent = useAgentStore();

onMounted(async () => {
  if (!agent.registered) {
    return await router.push('/register');
  }

  router.push('/').catch(console.error);
});

</script>

<template>
  <EmptyLayout>
    <RouterView />
  </EmptyLayout>
</template>

