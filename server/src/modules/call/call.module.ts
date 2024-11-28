import {Module} from "@nestjs/common";
import {SocketIoModule} from "@modules/socketio/socketio.module";
import {CallController} from "@modules/call/call.controller";

@Module({
    imports: [SocketIoModule],
    controllers: [CallController],
})
export class CallModule {

}
