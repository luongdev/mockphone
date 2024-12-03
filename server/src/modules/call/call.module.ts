import {Module} from "@nestjs/common";
import {SocketIoModule} from "@modules/socketio/socketio.module";
import {CallController} from "@modules/call/call.controller";
import {OtelModule} from "@modules/otel/otel.module";

@Module({
    imports: [SocketIoModule, OtelModule],
    controllers: [CallController],
})
export class CallModule {

}
