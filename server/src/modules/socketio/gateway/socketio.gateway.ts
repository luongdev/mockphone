import {OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway} from "@nestjs/websockets";
import {SocketIoStore} from "@modules/socketio/socketio.store";
import {Server} from 'socket.io';
import {AgentSocket} from "@modules/socketio/socketio.type";

@WebSocketGateway()
export class SocketIoGateway
    implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection<AgentSocket> {

    constructor(private readonly _socketStore: SocketIoStore) {
    }

    afterInit(server: Server): any {
        console.log(server.path())
        this._socketStore.clear();
    }

    handleConnection(client: AgentSocket): any {
        const { extension, domain } = client.handshake.query;
        if (!extension?.length || !domain?.length) {
            client.disconnect();
            return;
        }


        client.tryEmit = async (event: string, maxTries: number, timeout: number, ...args: any[]): Promise<any> => {
            let tries = 0;

            const emitWithAck = (): Promise<any> => {
                return new Promise((resolve, reject) => {
                    let isAcked = false;
                    const timer = setTimeout(() => {
                        if (!isAcked) reject(new Error('Ack timeout'));
                    }, timeout);
                    client.emit(event, args, (ack: any) => {
                        isAcked = true;
                        clearTimeout(timer);
                        resolve(ack);
                    });
                });
            };

            while (tries < maxTries) {
                try {
                    return await emitWithAck();
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (e) {
                    tries++;
                    if (tries >= maxTries) {
                        throw new Error(`Failed to emit event '${event}' after ${maxTries} attempts.`);
                    }
                }
            }
        }
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        client.agent = `${extension}@${domain}`;
        this._socketStore.addSocket(client);
    }

    handleDisconnect(client: AgentSocket): any {
        this._socketStore.removeSocket(client);
    }
}
