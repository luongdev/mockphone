import {Module} from "@nestjs/common";
import {CdrController} from "@modules/cdr/cdr.controller";
import {OtelModule} from "@modules/otel/otel.module";

@Module({
    imports: [OtelModule],
    controllers: [CdrController],
})
export class CdrModule {

}
