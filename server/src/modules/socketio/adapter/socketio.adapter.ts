import {IoAdapter} from "@nestjs/platform-socket.io";
import {INestApplicationContext} from "@nestjs/common";
import {SocketConfig} from "@configs/socket.config";


export class SocketIoAdapter extends IoAdapter {

    constructor(private readonly _app: INestApplicationContext) {
        super(_app);
    }

    createIOServer(port: number, options?: any): any {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment
        const socketConfig = this._app.get(SocketConfig);
        if (options) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
            if (socketConfig?.path) options.path = socketConfig.path;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
            if (socketConfig?.origins?.length) options.cors = { origin: socketConfig.origins.split(',') };
        }

        return super.createIOServer(0, options);
    }
}
