import {Socket} from "socket.io";

export type AgentSocket = Socket & {
    agent: string;
    tryEmit: (event: string, maxTries: number, timeout: number, ...args: any[]) => Promise<any>;
};
