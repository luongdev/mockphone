// src/services/socket.ts
import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'
import { SipService } from './sip'

export class SocketService {
  private socket: Socket | null = null
  public isConnected = ref(false)
  public notifications = ref<string[]>([])

  constructor(private readonly _sipService: SipService) {}

  public init(serverUrl: string) {
    const agent = this._sipService.getAgent();
    this.socket = io(serverUrl, {
      path: '/',
      autoConnect: true,
      ackTimeout: 500,
      query: {
        extension: agent.extension,
        domain: agent.domain,
      },
      transports: ['websocket', 'polling'],
    });

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