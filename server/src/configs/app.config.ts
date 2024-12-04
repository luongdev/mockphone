import { registerAs } from '@nestjs/config';
import { LogLevel } from '@nestjs/common';

export class AppConfig {
    port: number;
    nodeEnv: string;
    logLevel: LogLevel;
    prometheusURL?: string;
    otelCollectorURL?: string;
}

export default registerAs<AppConfig>('app', () => {
    return {
        nodeEnv: process.env.NODE_ENV ?? 'development',
        port: process.env.APP_PORT
            ? parseInt(process.env.APP_PORT, 10)
            : process.env.PORT
                ? parseInt(process.env.PORT, 10)
                : 3000,
        logLevel: (process.env.LOG_LEVEL ?? 'info').toLowerCase() as LogLevel,
        prometheusURL: process.env.PROMETHEUS_URL ?? '',
        otelCollectorURL: process.env.OTEL_COLLECTOR_URL ?? '',
    };
});
