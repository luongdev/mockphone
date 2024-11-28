<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
    <div class="p-6 rounded-lg shadow-lg bg-white max-w-sm w-full">
      <!-- Tiêu đề -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-700">Call Waiting</h2>
        <p class="text-gray-500">Enter a phone number to make a call or wait for an incoming call.</p>
      </div>
      
      <!-- Input số điện thoại -->
      <div class="mb-4">
        <input
          v-model="phoneNumber"
          type="text"
          placeholder="Enter phone number"
          class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <!-- Nút gọi -->
      <div class="flex justify-center">
        <button
          @click="makeCall"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
        >
          Call
        </button>
      </div>

      <!-- Thông báo chờ -->
      <div class="mt-6 text-center">
        <p class="text-gray-500">Waiting for incoming call...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { SocketServiceKey } from "../services/injector";
import { SocketService } from "../services/socket";

const socketService = inject<SocketService>(SocketServiceKey, (null as unknown as SocketService));
onMounted(() => {
  socketService.init('http://localhost:3000');
});

const phoneNumber = ref<string>("");

const makeCall = () => {
  if (!phoneNumber.value) {
    alert("Please enter a phone number.");
    return;
  }
  // Replace this alert with your actual call logic
  alert(`Calling ${phoneNumber.value}...`);
};
</script>
