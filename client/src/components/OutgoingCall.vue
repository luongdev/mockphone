// OutgoingCall.vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  recipientName: string;
  recipientNumber: string;
  recipientAvatar?: string;
}

const props = withDefaults(defineProps<Props>(), {
  recipientName: 'Unknown',
  recipientNumber: '',
  recipientAvatar: ''
})

const emit = defineEmits<{
  (e: 'endCall'): void;
}>()

const callDuration = ref<number>(0)
const formattedDuration = ref<string>('00:00')

let timer: NodeJS.Timer | undefined

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  timer = setInterval(() => {
    callDuration.value++
    formattedDuration.value = formatTime(callDuration.value)
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-80">
      <div class="flex flex-col items-center space-y-4">
        <!-- Recipient Avatar -->
        <div class="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
          <img 
            v-if="recipientAvatar" 
            :src="recipientAvatar" 
            :alt="recipientName" 
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-300">
            <span class="text-4xl text-gray-600">{{ recipientName[0] }}</span>
          </div>
        </div>

        <!-- Recipient Info -->
        <div class="text-center">
          <h2 class="text-xl font-semibold">{{ recipientName }}</h2>
          <p class="text-gray-600">{{ recipientNumber }}</p>
          <p class="text-gray-500 mt-2">{{ formattedDuration }}</p>
        </div>

        <!-- Control Buttons -->
        <div class="flex space-x-4 mt-4">
          <button class="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>

          <button class="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <button 
            @click="emit('endCall')"
            class="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.13a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>