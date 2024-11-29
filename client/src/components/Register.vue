// LoginForm.vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Domain } from './types';

export interface FormData {
  proxy: string;
  username: string;
  domain: string;
  password: string;
  autoAnswer: boolean;
}

interface FormErrors {
  proxy: string;
  username: string;
  password: string;
}

const domains = ref<Domain[]>([
  { id:'mock.metechvn.com' , name: 'mock.metechvn.com' },
  { id:'pjico.metechvn.com' , name: 'pjico.metechvn.com' },
  { id:'voice.metechvn.com', name: 'voice.metechvn.com' },
  { id:'voiceuat.metechvn.com', name: 'voiceuat.metechvn.com' },
])

const formData = ref<FormData>({
  proxy: 'wss://proxy-dev.metechvn.com:7443',
  username: '1000',
  domain: domains.value[0].name,
  password: 'Abcd@54321',
  autoAnswer: false,
})

const errors = ref<FormErrors>({
  proxy: '',
  username: '',
  password: ''
})

const isSubmitting = ref<boolean>(false)

const emit = defineEmits<{
  (e: 'login', data: FormData): void;
}>()

const validateProxy = (value: string): boolean => {
  const proxyRegex = /^(ws|wss):\/\/[a-zA-Z0-9.-]+(:\d+)?\/?.*$/
  return proxyRegex.test(value)
}

const validateUsername = (value: string): boolean => {
  // Only alphanumeric characters and some special characters
  const usernameRegex = /^[a-zA-Z0-9._-]+$/
  return usernameRegex.test(value)
}

const fullUsername = computed(() => {
  return `${formData.value.username}@${formData.value.domain}`
})

const validateForm = (): boolean => {
  let isValid = true
  errors.value = {
    proxy: '',
    username: '',
    password: ''
  }

  // Validate proxy
  if (!formData.value.proxy) {
    errors.value.proxy = 'Proxy is required'
    isValid = false
  } else if (!validateProxy(formData.value.proxy)) {
    errors.value.proxy = 'Invalid proxy format. Must be ws://domain:port/path or wss://domain:port/path'
    isValid = false
  }

  // Validate username
  if (!formData.value.username) {
    errors.value.username = 'Username is required'
    isValid = false
  } else if (!validateUsername(formData.value.username)) {
    errors.value.username = 'Username can only contain letters, numbers, dots, underscores and hyphens'
    isValid = false
  }

  // Validate password
  if (!formData.value.password) {
    errors.value.password = 'Password is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (validateForm()) {
    isSubmitting.value = true
    try {
      const submitData = { ...formData.value }
      emit('login', submitData)
    } finally {
      isSubmitting.value = false
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- Proxy Input -->
          <div>
            <label for="proxy" class="block text-sm font-medium text-gray-700">
              Proxy URL
            </label>
            <div class="mt-1">
              <input
                id="proxy"
                v-model="formData.proxy"
                type="text"
                required
                placeholder="ws://domain:port/path"
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                :class="{'border-red-500': errors.proxy}"
              >
              <p v-if="errors.proxy" class="mt-1 text-sm text-red-600">
                {{ errors.proxy }}
              </p>
            </div>
          </div>

          <!-- Username Input with Domain Dropdown -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div class="mt-1">
                <input
                  id="username"
                  v-model="formData.username"
                  type="text"
                  required
                  placeholder="Enter username"
                  class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  :class="{'border-red-500': errors.username}"
                >
              </div>
            </div>

            <div>
              <label for="domain" class="block text-sm font-medium text-gray-700">
                Domain
              </label>
              <div class="mt-1">
                <select
                  id="domain"
                  v-model="formData.domain"
                  class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option v-for="domain in domains" :key="domain.id" :value="domain.name">
                    {{ domain.name }}
                  </option>
                </select>
              </div>
            </div>

            <p v-if="errors.username" class="col-span-2 mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

          <!-- Full Username Preview -->
          <div class="text-sm text-gray-500">
            Full username: {{ fullUsername }}
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="formData.password"
                type="password"
                required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                :class="{'border-red-500': errors.password}"
              >
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                {{ errors.password }}
              </p>
            </div>
          </div>

          <div>
            <label for="autoAnswer" class="block text-sm font-medium text-gray-700">
              Auto answer
            </label>
            <div class="mt-1">
              <input
                id="autoAnswer"
                v-model="formData.autoAnswer"
                type="checkbox"
              >
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg 
                v-if="!isSubmitting"
                class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                aria-hidden="true"
              >
                <path 
                  fill-rule="evenodd" 
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                  clip-rule="evenodd" 
                />
              </svg>
              <svg 
                v-else
                class="animate-spin h-5 w-5 text-indigo-500" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  class="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  stroke-width="4"
                />
                <path 
                  class="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
            {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>