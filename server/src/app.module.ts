import {Module} from '@nestjs/common';
import {SocketIoModule} from "@modules/socketio/socketio.module";
import appConfig, {AppConfig} from "@configs/app.config";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AllConfigType} from "@configs/config.type";
import socketConfig from "@configs/socket.config";
import {CallModule} from "@modules/call/call.module";
import {CdrModule} from "@modules/cdr/cdr.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, socketConfig]
        }),
        CdrModule,
        CallModule,
        SocketIoModule,
    ],
    controllers: [],
    providers: [
        {
            provide: AppConfig,
            useFactory: (allConfig: ConfigService<AllConfigType>): AppConfig => {
                return allConfig.getOrThrow<AppConfig>('app');
            },
            inject: [ConfigService<AllConfigType>],
        }
    ],
})
export class AppModule {
}
