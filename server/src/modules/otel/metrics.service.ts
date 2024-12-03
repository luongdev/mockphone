import { Injectable } from '@nestjs/common';
import { Meter } from '@opentelemetry/api';
import { MeterProvider, ExplicitBucketHistogramAggregation, View } from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS;

@Injectable()
export class MetricsService {
    private meter: Meter;
    private waitTimeHistogram;
    private connectTimeHistogram;
    private callsCounter;
    private successCallsCounter;
    private failedCallsCounter;

    constructor() {
        const exporter = new PrometheusExporter({}, () => {
            console.log(
                `prometheus scrape endpoint: http://localhost:${port}${endpoint}`,
            );
        });

        const connectView = new View({
            aggregation: new ExplicitBucketHistogramAggregation([500, 1000, 5000]),
            instrumentUnit: 'connect_ms',
        })
        const waitView = new View({
            aggregation: new ExplicitBucketHistogramAggregation([1000, 10000, 30000]),
            instrumentUnit: 'wait_ms',
        })

        const meterProvider = new MeterProvider({ readers: [exporter], views: [connectView, waitView] });
        this.meter = meterProvider.getMeter('call-metrics');


        this.connectTimeHistogram = this.meter.createHistogram('connect_time', {
            description: 'Connection time in milliseconds',
            unit: 'connect_ms'
        });

        this.waitTimeHistogram = this.meter.createHistogram('wait_time', {
            description: 'Wait time in milliseconds',
            unit: 'wait_ms',
        });

        this.callsCounter = this.meter.createCounter('calls_total', {
            description: 'Total number of calls',
        });

        this.successCallsCounter = this.meter.createCounter('success_calls_total', {
            description: 'Total number of successful calls',
        });

        this.failedCallsCounter = this.meter.createCounter('failed_calls', {
            description: 'Total number of failed calls by error code',
        });

    }

    recordConnectTime(timeInMillis: number, callId: string) {
        this.connectTimeHistogram.record(timeInMillis, { callId });
    }

    recordWaitTime(timeInMillis: number, callId: string) {
        this.waitTimeHistogram.record(timeInMillis, { callId });
    }

    recordSuccessCall(callId: string | undefined) {
        this.callsCounter.add(1, { callId });
        this.successCallsCounter.add(1, { callId });
    }

    recordFailedCall(cause: string | undefined) {
        this.callsCounter.add(1);
        this.failedCallsCounter.add(1, { cause });
    }
}
