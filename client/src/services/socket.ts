// src/services/socket.ts
import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'
import { SipService } from './sip'

import { useRouter } from 'vue-router';

export class SocketService {
  private socket: Socket | null = null
  public isConnected = ref(false)
  public notifications = ref<string[]>([])

  private _router: any;

  constructor(private readonly _sipService: SipService) { }

  public init(serverUrl: string) {
    const agent = this._sipService.getAgent();
    this.socket = io(serverUrl, {
      path: '/ws',
      autoConnect: true,
      ackTimeout: 500,
      query: {
        extension: agent.extension,
        domain: agent.domain,
      },
      transports: ['websocket'],
    });

    this._router = useRouter();


    this.socket.on('connect', () => {
      this.isConnected.value = true
    })

    this.socket.on('disconnect', () => {
      this.isConnected.value = false
    })

    this.socket.on('INCOMING_CALL', async (data: any, ack: Function) => {
      const {
        uuid,
        domain,
        direction,
        extension,
        phoneNumber,
        globalCallId,
        eventTime,
        timeout,
        backend,
      } = data ?? {};

      const maxTime = eventTime + timeout * 1000;
      if (Date.now() <= maxTime) {
        await this._router.push({
          path: '/incoming',
          replace: true,
          query: {
            uuid,
            domain,
            direction,
            extension,
            phoneNumber,
            globalCallId,
            backend,
          }
        });
      }

      ack({ success: true, message: 'Notification pushed' });
    });

    this.socket.on('HANGUP', async (data: any, ack: Function) => {
      const {
        uuid,
        domain,
        extension,
        globalCallId,
        eventTime,
        timeout,
      } = data ?? {};
      const maxTime = eventTime + timeout * 1000;
      if (Date.now() <= maxTime) {
        await this._router.push({
          path: '/',
          replace: true,
          query: {
            uuid,
            domain,
            extension,
            globalCallId,
          }
        });
      }

      ack({ success: true, message: 'Cancel pushed' });
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}