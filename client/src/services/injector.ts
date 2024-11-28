import { ref } from 'vue'
import type { App } from 'vue'
import { SipService } from './sip'
import { SocketService } from './socket'

export const SipServiceKey = Symbol('SipService')
export const SocketServiceKey = Symbol('SocketService')

export function createServices() {
  const sipService = new SipService();
  const socketService = new SocketService('http://your-socket-server.com');

  return {
    sipService,
    socketService
  }
}


export function registerServices(app: App) {
  const services = createServices()
  
  app.provide(SipServiceKey, services.sipService)
  app.provide(SocketServiceKey, services.socketService)
}