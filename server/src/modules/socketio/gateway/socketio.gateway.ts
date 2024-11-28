import {OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway} from "@nestjs/websockets";
import {SocketIoStore} from "@modules/socketio/socketio.store";
import {Socket, Server} from 'socket.io';

@WebSocketGateway()
export class SocketIoGateway
    implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection<Socket> {

    constructor(private readonly _socketStore: SocketIoStore) {
    }

    afterInit(server: Server): any {
        console.log(server.path())
        this._socketStore.clear();
    }

    handleConnection(client: Socket): any {
        this._socketStore.addSocket(client);
    }

    handleDisconnect(client: Socket): any {
        this._socketStore.removeSocket(client);
    }
}
