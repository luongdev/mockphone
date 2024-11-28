import {Module} from "@nestjs/common";
import {SocketIoGateway} from "@modules/socketio/gateway/socketio.gateway";
import {SocketIoStore} from "@modules/socketio/socketio.store";
import {ConfigService} from "@nestjs/config";
import {AllConfigType} from "@configs/config.type";
import {SocketConfig} from "@configs/socket.config";

@Module({
    imports: [],
    providers: [
        {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            provide: SocketConfig,
            useFactory: (allConfig: ConfigService<AllConfigType>): SocketConfig => {
                return allConfig.getOrThrow<SocketConfig>('socket');
            },
            inject: [ConfigService<AllConfigType>],
        },
        SocketIoGateway,
        SocketIoStore,
    ],
    exports: [SocketIoStore],
})
export class SocketIoModule {}
