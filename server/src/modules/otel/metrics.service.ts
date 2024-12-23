import {Injectable} from '@nestjs/common';
import {Meter} from '@opentelemetry/api';
import {
    MeterProvider,
    ExplicitBucketHistogramAggregation,
    View,
    MetricReader,
    PeriodicExportingMetricReader
} from '@opentelemetry/sdk-metrics';
import {PrometheusExporter} from '@opentelemetry/exporter-prometheus';
import {AppConfig} from "@configs/app.config";
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-proto';

const {endpoint,port} = PrometheusExporter.DEFAULT_OPTIONS;

@Injectable()
export class MetricsService {
    private meter: Meter;
    private waitTimeHistogram;
    private connectTimeHistogram;
    private callsCounter;
    private successCallsCounter;
    private failedCallsCounter;

    private offerTimesHistogram;

    constructor(appConfig: AppConfig) {
        const readers: MetricReader[] = [];
        if (appConfig.prometheusURL?.length) {
            const reader = new PrometheusExporter({port,host:'0.0.0.0'}, () => {
                console.log(`prometheus scrape endpoint: http://0.0.0.0:${port}${endpoint}`);
            });
            readers.push(reader);
        }

        if (appConfig.otelCollectorURL?.length) {
            const reader = new PeriodicExportingMetricReader({
                 
                exporter: new OTLPMetricExporter({url: appConfig.otelCollectorURL}),
                exportIntervalMillis: 5000,
            });
            readers.push(reader);
        }

        const connectView = new View({
            aggregation: new ExplicitBucketHistogramAggregation([500, 1000, 5000]),
            instrumentUnit: 'connect_ms',
        });
        const waitView = new View({
            aggregation: new ExplicitBucketHistogramAggregation([1000, 10000, 30000]),
            instrumentUnit: 'wait_ms',
        });
        const offerView = new View({
            aggregation: new ExplicitBucketHistogramAggregation([1, 2, 3]),
            instrumentUnit: 'offer_times',
        });

        const meterProvider = new MeterProvider({
            readers, views: [connectView, waitView, offerView]
        });
        this.meter = meterProvider.getMeter('call-metrics');


        this.connectTimeHistogram = this.meter.createHistogram('connect_time', {
            description: 'Connection time in milliseconds',
            unit: 'connect_ms'
        });

        this.waitTimeHistogram = this.meter.createHistogram('wait_time', {
            description: 'Wait time in milliseconds',
            unit: 'wait_ms',
        });

        this.offerTimesHistogram = this.meter.createHistogram('offer_times', {
            description: 'Offer count times',
            unit: 'offer_times',
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

    recordConnectTime(timeInMillis: number) {
        this.connectTimeHistogram.record(timeInMillis);
    }

    recordOfferTimes(num: number) {
        this.offerTimesHistogram.record(num);
    }

    recordWaitTime(timeInMillis: number) {
        this.waitTimeHistogram.record(timeInMillis);
    }

    recordSuccessCall(callId: string | undefined) {
        console.log('Call success: ', callId);
        this.callsCounter.add(1);
        this.successCallsCounter.add(1);
    }

    recordFailedCall(cause: string | undefined) {
        this.callsCounter.add(1);
        this.failedCallsCounter.add(1, {cause});
    }
}
