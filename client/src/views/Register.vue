<script setup lang="ts">

import { inject, watch } from 'vue';
import { useRouter } from 'vue-router';
import { URI } from 'jssip';

import { SipServiceKey, SocketServiceKey } from '../services/injector';
import { SipService } from '../services/sip';
import { SocketService } from '../services/socket';

import Register, { FormData } from '../components/Register.vue';

const router = useRouter();

const sipService = inject<SipService>(SipServiceKey, (null as unknown as SipService));
const socketService = inject<SocketService>(SocketServiceKey, (null as unknown as SocketService));

watch(sipService.isRegistered, async () => {
  await router.push('/');
});

const handleSubmit = (data: FormData) => {
  const sipUri = new URI('sip', data.username, data.domain);
  sipService?.init({
    sipUri: sipUri.toString(),
    password: data.password,
    websocketUrl: data.proxy,
  });
}

</script>

<template>
  <Register @login="handleSubmit" />
</template>