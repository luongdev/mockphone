import JsSIP from 'jssip'
import { ref } from 'vue'

export class SipService {
  private ua: JsSIP.UA | null = null
  private session: JsSIP.RTCSession | null = null
  public isRegistered = ref(false)
  public isInCall = ref(false)

  private config = ref({});

  constructor() {}

  public init(config: { sipUri: string,  password: string,  websocketUrl: string }) {
    this.config.value = config;
    const socket = new JsSIP.WebSocketInterface(config.websocketUrl)
    
    const configuration = {
      sockets: [socket],
      uri: config.sipUri,
      contact_uri: config.sipUri,
      password: config.password,
    }

    this.ua = new JsSIP.UA(configuration)

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