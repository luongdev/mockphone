import {Injectable} from "@nestjs/common";
import {Socket} from "socket.io";


@Injectable()
export class SocketIoStore {
    private readonly _sockets: Map<string, Socket> = new Map<string, Socket>();

    get sockets(): Map<string, Socket> {
        return this._sockets;
    }

    addSocket(socket: Socket): void {
        this._sockets.set(socket.id, socket);
    }

    removeSocket(socket: Socket): void {
        this._sockets.delete(socket.id);
    }

    getSocket(id: string): Socket | undefined {
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
