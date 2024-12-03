import {Body, Controller, Post} from "@nestjs/common";
import {MetricsService} from "@modules/otel/metrics.service";

interface CDRBody {
    variables: Record<string, string>;
    app_log: any[];
}

@Controller('cdr')
export class CdrController {

    constructor(private readonly _metricsService: MetricsService) {
    }

    @Post('json')
    json(@Body() body: CDRBody) {
        const { variables, app_log } = body;
        if (!app_log || !variables) return { success: false };

        const cause = variables.hangup_cause || 'NONE';
        const callId = variables.uuid;
        const startUepoch = (parseInt(variables.start_uepoch, 10) || 0);
        const offerUepoch = parseInt(variables.cc_first_offer_uepoch, 10) || 0;
        const answerUepoch = parseInt(variables.bridge_uepoch, 10) || 0;
        const endUepoch = (parseInt(variables.end_uepoch, 10) || 0);

        const waitTime = answerUepoch ? answerUepoch - startUepoch : endUepoch - startUepoch;

        console.log({
            callId,
            cause,
            startUepoch,
            answerUepoch,
            endUepoch,
        })

        this._metricsService.recordWaitTime(Math.floor(waitTime / 1000), callId);

        if (variables && variables.hangup_cause !== 'NORMAL_CLEARING') {
            this._metricsService.recordFailedCall(variables.hangup_cause);
        } else {
            if (offerUepoch && answerUepoch) {
                this._metricsService.recordSuccessCall(callId);
                this._metricsService.recordConnectTime(Math.floor(answerUepoch / 1000 - offerUepoch), callId);
            } else {
                this._metricsService.recordFailedCall(cause);
            }
        }

        return { success: true };
    }
}
