import { registerAs } from '@nestjs/config';

export class SocketConfig {
    path: string;
    namespace?: string | RegExp;
    connectTimeout?: number;
    pingTimeout?: number;
    pingInterval?: number;
    transports?: string;
    origins?: string;
}

export default registerAs<SocketConfig>('socket', () => {

    return {
        path: '/ws',
        pingInterval: 5000,
        pingTimeout: 1500,
        namespace: 'default',
        connectTimeout: 10000,
        transports: 'polling,websocket',
        origins: '*:*',
    } as SocketConfig;
});
