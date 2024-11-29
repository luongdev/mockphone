import { UA, WebSocketInterface, URI } from 'jssip'
import { RTCSession } from 'jssip/lib/RTCSession'
import { ref } from 'vue'
import { router } from '../main';

export interface Config {
  sipUri: string;
  password: string;
  websocketUrl: string;
}
export class SipService {
  private ua: UA | null = null
  private session: RTCSession | null = null
  public isRegistered = ref(false)
  public isInCall = ref(false)

  private config: Config | undefined;

  constructor() {}

  public getAgent() {
    const uri = URI.parse(this.config?.sipUri ?? '');

    return {
      extension: uri.user,
      domain: uri.host
    }
  }

  public init(config: Config) {
    this.config = config;
    
    const socket = new WebSocketInterface(config.websocketUrl)
    
    const configuration = {
      sockets: [socket],
      uri: config.sipUri,
      contact_uri: config.sipUri,
      password: config.password,
    }

    this.ua = new UA(configuration)

    this.ua.on('registered', () => {
      this.isRegistered.value = true
    })

    this.ua.on('unregistered', () => {
      this.isRegistered.value = false
    })

    this.ua.on('newRTCSession', ({ session }) => {
      this.session = session
      
      session.on('accepted', () => {
        this.isInCall.value = true;

        const remote = new MediaStream();
        session.connection?.getReceivers()?.forEach((receiver: any) => {
          if (receiver.track) remote.addTrack(receiver.track);
        });
  
        const audioElm = new window.Audio();
        audioElm.srcObject = remote;
        audioElm.play().catch(console.error);
      })
      
      session.on('ended', async () => {
        this.isInCall.value = false
        this.session = null

        await router.push('/');
      })
    })

    this.ua.start()
  }

  public makeCall(number: string, headers?: any) {
    if (!this.ua || !this.isRegistered.value) {
      throw new Error('SIP not registered')
    }

    const extraHeaders: string[] = [];
    Object.keys(headers).forEach(k => {
      const header = `X-${k}: ${headers[k]}`;
      extraHeaders.push(header);
    })

    const options = {
      mediaConstraints: { audio: true, video: false },
      extraHeaders,
      sessionTimersExpires: 120,
    }

    this.session = this.ua.call(number, options);
    this.session.on('ended', async () => {
      await router.push('/');
    });

    return this.session;
  }

  public hangup() {
    if (this.session) {
      this.session.terminate()
    }
  }

  public answer() {
    if (this.session) {
      const options = {
        mediaConstraints: { audio: true, video: false }
      }
      this.session.answer(options)
    }
  }
}