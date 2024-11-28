import {Injectable} from "@nestjs/common";
import {AgentSocket} from "@modules/socketio/socketio.type";


@Injectable()
export class SocketIoStore {
    private readonly _sockets: Map<string, AgentSocket> = new Map<string, AgentSocket>();

    get sockets(): Map<string, AgentSocket> {
        return this._sockets;
    }

    addSocket(socket: AgentSocket): void {
        this._sockets.set(socket.id, socket);
        if (socket.agent?.length) {
            this._sockets.set(socket.agent, socket);
        }
    }

    removeSocket(socket: AgentSocket): void {
        this._sockets.delete(socket.id);
        if (socket.agent?.length) {
            this._sockets.delete(socket.agent);
        }
    }

    getSocket(id: string): AgentSocket | undefined {
        return this._sockets.get(id);
    }

    hasSocket(id: string): boolean {
        return this._sockets.has(id);
    }

    get size(): number {
        return this._sockets.size;
    }

    clear(): void {
        this._sockets.clear();
    }
}
