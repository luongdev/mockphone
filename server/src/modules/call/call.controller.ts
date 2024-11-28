import {Body, Controller, Delete, Post} from "@nestjs/common";
import {SocketIoStore} from "@modules/socketio/socketio.store";

interface Response {
    success: boolean;
    message?: string;
}

@Controller('call')
export class CallController {

    constructor(private readonly _socketStore: SocketIoStore) {
    }

    @Post('incoming')
    async incomingCall(
        @Body('uuid') uuid: string,
        @Body('domain') domain: string,
        @Body('direction') direction: string,
        @Body('extension') extension: string,
        @Body('phoneNumber') phoneNumber: string,
        @Body('globalCallId') globalCallId: string,
        @Body('eventTime') eventTime: number,
        @Body('timeout') timeout: number,
        @Body('backend') backend: string,
    ): Promise<Response> {
        const socket = this._socketStore.getSocket(`${extension}@${domain}`);
        if (!socket) {
            return { success: false, message: 'Extension not found' };
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await socket.tryEmit('INCOMING_CALL', 3, 200, {
            uuid,
            domain,
            direction,
            extension,
            phoneNumber,
            globalCallId,
            eventTime,
            timeout,
            backend,
        });
    }

    @Delete('cancel')
    async cancel(
        @Body('uuid') uuid: string,
        @Body('domain') domain: string,
        @Body('extension') extension: string,
        @Body('globalCallId') globalCallId: string,
        @Body('eventTime') eventTime: number,
        @Body('timeout') timeout: number,
    ): Promise<Response> {
        const socket = this._socketStore.getSocket(`${extension}@${domain}`);
        if (!socket) {
            return { success: false, message: 'Extension not found' };
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await socket.tryEmit('CANCEL', 3, 200, { uuid, domain, extension, globalCallId, eventTime, timeout });
    }

}
