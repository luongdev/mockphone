// src/services/socket.ts
import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

export class SocketService {
  private socket: Socket | null = null
  public isConnected = ref(false)
  public notifications = ref<string[]>([])

  constructor(private serverUrl: string) {}

  public init() {
    this.socket = io(this.serverUrl)

    this.socket.on('connect', () => {
      this.isConnected.value = true
    })

    this.socket.on('disconnect', () => {
      this.isConnected.value = false
    })

    this.socket.on('notification', (message: string) => {
      this.notifications.value.push(message)
    })
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}