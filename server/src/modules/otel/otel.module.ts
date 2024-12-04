import {Module} from '@nestjs/common';
import {MetricsService} from './metrics.service';
import {AppConfig} from "@configs/app.config";
import {ConfigService} from "@nestjs/config";
import {AllConfigType} from "@configs/config.type";

@Module({
    providers: [
        MetricsService,
        {
            provide: AppConfig,
            useFactory: (allConfig: ConfigService<AllConfigType>): AppConfig => {
                return allConfig.getOrThrow<AppConfig>('app');
            },
            inject: [ConfigService<AllConfigType>],
        }
    ],
    exports: [MetricsService],
    imports: []
})
export class OtelModule {

}
