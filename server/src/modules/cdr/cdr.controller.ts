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
        const {variables, app_log} = body;
        if (!app_log || !variables) return {success: false};

        console.log('CDR', JSON.stringify(body));

        const cause = variables.hangup_cause || 'NONE';
        const callId = variables.uuid;
        const startUepoch = (parseInt(variables.start_uepoch, 10) || 0);
        const offerUepoch = parseInt(variables.cc_first_offer_uepoch, 10) || 0;
        const answerUepoch = parseInt(variables.bridge_uepoch, 10) || 0;
        const endUepoch = (parseInt(variables.end_uepoch, 10) || 0);

        const waitTime = answerUepoch ? answerUepoch - startUepoch : endUepoch - startUepoch;

        this._metricsService.recordWaitTime(Math.floor(waitTime / 1000));

        let offerTimes = 0;
        if (variables && variables.hangup_cause !== 'NORMAL_CLEARING') {
            this._metricsService.recordFailedCall(variables.hangup_cause);
        } else {
            if (offerUepoch && answerUepoch) {
                offerTimes = 1;
                this._metricsService.recordSuccessCall(callId);
                this._metricsService.recordConnectTime(Math.floor(answerUepoch / 1000 - offerUepoch));
            } else {
                this._metricsService.recordFailedCall(cause);
            }
        }

        offerTimes += variables.cc_failed_agents?.length ? variables.cc_failed_agents.split('|').length : 0;
        this._metricsService.recordOfferTimes(offerTimes);

        return { success: true };
    }
}
