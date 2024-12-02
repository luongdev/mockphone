import { UA, WebSocketInterface, URI } from 'jssip'
import { RTCSession } from 'jssip/lib/RTCSession'
import { ref } from 'vue'
import { router, getMediaStream } from '../main'
import { CallOptions } from 'jssip/lib/UA';

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

        setTimeout(() => {
          this.hangup();
        }, 18000);
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

    const mediaStream = getMediaStream();
    if (mediaStream) {
      options.mediaStream = mediaStream;
      // mediaStream.getTracks().forEach((track) => {
      //   track.onended = () => {
      //     console.log('MediaStreamTrack has ended');
      //   };
      // });
      // // mediaStream.getAudioTracks()[0].addEventListener("ended", () => {
      // //   this.session?.terminate();
      // // });
    }

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