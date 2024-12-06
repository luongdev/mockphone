// src/services/socket.ts
import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'
import { SipService } from './sip'

import { useRouter } from 'vue-router';

export class SocketService {
  private socket: Socket | null = null
  public isConnected = ref(false)

  private _router: any;

  constructor(private readonly _sipService: SipService) { }

  public init(serverUrl: string) {
    if (this.isConnected.value) { return; }

    const agent = this._sipService.getAgent();
    this.socket = io(serverUrl, {
      path: '/ws',
      autoConnect: true,
      ackTimeout: 200,

      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 2000,
      timeout: 2000,

      query: {
        extension: agent.extension,
        domain: agent.domain,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.io.on('open', () => {
      console.log('Socket open');
    });

    // this.socket.io.on('ping', () => {
    //   console.log('Socket ping', new Date());
    // });

    this.socket.io.on('reconnect', (attempt: number) => {
      console.log('Socket reconnect: ', attempt);
    })

    this._router = useRouter();


    this.socket.on('connect', () => {
      this.isConnected.value = true
      console.log('socket connected');
    })

    this.socket.on('connect_error', (err) => {
      console.log('Socket connect_error: ' + err.message, new Date());
    });

    this.socket.on('disconnect', () => {
      this.isConnected.value = false;
      console.log('socket disconnected');
    })

    this.socket.on('INCOMING_CALL', async (data: any, metadata: any, ack: Function) => {
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

      ack({ success: true, message: 'Notification pushed', ...metadata });
    });

    this.socket.on('HANGUP', async (data: any, metadata: any, ack: Function) => {
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

      ack({ success: true, message: 'Cancel pushed', ...metadata });
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}
