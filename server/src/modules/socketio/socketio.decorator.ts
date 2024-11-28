import {INestApplication} from "@nestjs/common";
import {SocketIoAdapter} from "@modules/socketio/adapter/socketio.adapter";
import {WebSocketGateway} from "@nestjs/websockets";
import {SocketConfig} from "@configs/socket.config";

export async function SocketIoGateway(clazz: any, app: INestApplication) {
    const isCluster = false;
    let adapter: any;
    if (isCluster) {
        // adapter = new RedisIoAdapter();
        // await adapter.connectToRedis();
    } else {
        adapter = new SocketIoAdapter(app);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment
    const socketConfig = await app.resolve(SocketConfig);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    app.useWebSocketAdapter(adapter);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return
    return WebSocketGateway({ adapter, ...socketConfig })(clazz);
}
