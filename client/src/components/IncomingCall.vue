<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  callerName: string;
  callerNumber: string;
  callerAvatar?: string;
}

const props = withDefaults(defineProps<Props>(), {
  callerName: 'Unknown Caller',
  callerNumber: '',
  callerAvatar: ''
})

const emit = defineEmits<{
  (e: 'accept'): void;
  (e: 'decline'): void;
}>()

const callDuration = ref<string>('00:00')
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-80">
      <div class="flex flex-col items-center space-y-4">
        <!-- Caller Avatar -->
        <div class="w-24 h-24 rounded-full bg-gray-200 overflow-hidden animate-pulse">
          <img 
            v-if="callerAvatar" 
            :src="callerAvatar" 
            :alt="callerName" 
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-300">
            <span class="text-4xl text-gray-600">{{ callerName[0] }}</span>
          </div>
        </div>

        <!-- Caller Info -->
        <div class="text-center">
          <h2 class="text-xl font-semibold">{{ callerName }}</h2>
          <p class="text-gray-600">{{ callerNumber }}</p>
          <p class="text-green-500 mt-2">Incoming Call...</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-4 mt-6">
          <button 
            @click="emit('decline')"
            class="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button 
            @click="emit('accept')"
            class="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>