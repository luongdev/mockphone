import {IoAdapter} from "@nestjs/platform-socket.io";
import {INestApplicationContext} from "@nestjs/common";
import {SocketConfig} from "@configs/socket.config";


export class SocketIoAdapter extends IoAdapter {

    constructor(private readonly _app: INestApplicationContext) {
        super(_app);
    }

    createIOServer(port: number, options?: any): any {
        const socketConfig = this._app.get(SocketConfig);
        if (options) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (socketConfig?.path) options.path = socketConfig.path;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (socketConfig?.origins?.length) options.cors = { origin: socketConfig.origins.split(',') };

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (socketConfig?.transports?.length) options.transports = socketConfig.transports.split(',');

            if (socketConfig?.pingInterval && socketConfig.pingInterval > 1000) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                options.pingInterval = socketConfig.pingInterval;
            }

            if (socketConfig?.pingTimeout && socketConfig.pingTimeout > 100) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                options.pingTimeout = socketConfig.pingTimeout;
            }

        }

        return super.createIOServer(0, options);
    }
}
