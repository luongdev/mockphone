import { UA, WebSocketInterface, URI } from 'jssip'
import { RTCSession } from 'jssip/lib/RTCSession'
import { ref } from 'vue'
import { router } from '../main'
import { CallOptions } from 'jssip/lib/UA';


const _fetch = async (ctx: AudioContext, dst: MediaStreamAudioDestinationNode, onSrcEnded?: (e: any) => void) => {
  const fPath = `/countdown.mp3`;

  return Promise.resolve()
  .then(async () => await fetch(fPath))
  .then(async (res: Response) => await res.arrayBuffer())
  .then(async (buff: ArrayBuffer) => await ctx.decodeAudioData(buff))
  .then(async (buff: AudioBuffer) => {
    const src = ctx.createBufferSource();
    src.buffer = buff;
    src.connect(dst);
    if (onSrcEnded) src.onended = onSrcEnded;
    src.start();
  })
  .catch(console.error);
}

export interface Config {
  sipUri: string;
  password: string;
  websocketUrl: string;
  autoAnswer: boolean;
}
export class SipService {
  private ua: UA | null = null
  private session: RTCSession | null = null
  public isRegistered = ref(false)
  public isInCall = ref(false)
  public autoAnswer = ref(false);
  

  private config: Config | undefined;

  constructor() { }

  public getAgent() {
    const uri = URI.parse(this.config?.sipUri ?? '');

    return {
      extension: uri.user,
      domain: uri.host
    }
  }

  public init(config: Config) {
    this.config = config;
    this.autoAnswer.value = config.autoAnswer;
    
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
      this.session = session as RTCSession;
      
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

  public async makeCall(number: string, headers?: any) {
    if (!this.ua || !this.isRegistered.value) {
      throw new Error('SIP not registered')
    }

    const extraHeaders: string[] = [];
    Object.keys(headers).forEach(k => {
      const header = `X-${k}: ${headers[k]}`;
      extraHeaders.push(header);
    });
  
    const options = {
      extraHeaders,
      sessionTimersExpires: 120,
      mediaConstraints: {
        preferCurrentTab: true,
        audio: true,
        video: false,
      },
      pcConfig: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
    } as CallOptions;

    const ctx = new AudioContext();
    const dst = ctx.createMediaStreamDestination();

    _fetch(ctx, dst, () => this.hangup()).catch(console.error);

    options.mediaStream = dst.stream;

    this.ua.call(number, options);    
  }   

  public hangup() {
    if (this.session) {
      this.session.terminate()
      this.session = null;
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