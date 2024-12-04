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

    constructor(appConfig: AppConfig) {
        const readers: MetricReader[] = [];
        if (appConfig.prometheusURL?.length) {
            const { host, port: finalPort } = this._parseHostAndPort(appConfig.prometheusURL);
            const reader = new PrometheusExporter({port,host,preventServerStart:false}, () => {
                console.log(
                    `prometheus scrape endpoint: http://${host}:${finalPort}${endpoint}`,
                );
            });
            readers.push(reader);
            readers.push(new PrometheusExporter({port,preventServerStart:false}, () => {
                console.log(
                    `local prometheus listen on: http://0.0.0.0:${finalPort}${endpoint}`,
                );
            }));
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
        })
        const waitView = new View({
            aggregation: new ExplicitBucketHistogramAggregation([1000, 10000, 30000]),
            instrumentUnit: 'wait_ms',
        })

        const meterProvider = new MeterProvider({
            readers, views: [connectView, waitView]
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
        this.connectTimeHistogram.record(timeInMillis, {callId});
    }

    recordWaitTime(timeInMillis: number, callId: string) {
        this.waitTimeHistogram.record(timeInMillis, {callId});
    }

    recordSuccessCall(callId: string | undefined) {
        this.callsCounter.add(1, {callId});
        this.successCallsCounter.add(1, {callId});
    }

    recordFailedCall(cause: string | undefined) {
        this.callsCounter.add(1);
        this.failedCallsCounter.add(1, {cause});
    }

    private _parseHostAndPort(url: string): { host: string; port: number | undefined } {
        try {
            const parsedUrl = new URL(url);
            const host = parsedUrl.hostname;
            const port = parsedUrl.port ? parseInt(parsedUrl.port) : undefined;
            return { host, port };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            throw new Error(`Invalid URL: ${url}`);
        }
    }
}
