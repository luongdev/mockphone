import { UA, WebSocketInterface, URI } from 'jssip'
import { RTCSession } from 'jssip/lib/RTCSession'
import { ref } from 'vue'

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
        this.isInCall.value = true
      })
      
      session.on('ended', () => {
        this.isInCall.value = false
        this.session = null
      })
    })

    this.ua.start()
  }

  public makeCall(number: string) {
    if (!this.ua || !this.isRegistered.value) {
      throw new Error('SIP not registered')
    }

    const options = {
      mediaConstraints: { audio: true, video: false }
    }

    this.ua.call(number, options)
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