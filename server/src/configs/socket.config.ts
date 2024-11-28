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
        path: '/',
        pingInterval: 10000,
        pingTimeout: 5000,
        namespace: 'default',
        connectTimeout: 45000,
        transports: 'polling,websocket',
        origins: '*:*',
    } as SocketConfig;
});
