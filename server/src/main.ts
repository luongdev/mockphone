import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {AppConfig} from "@configs/app.config";
import {SocketIoGateway} from "@modules/socketio/socketio.decorator";
import {WebSocketGateway} from "@nestjs/websockets";

import {NodeSDK} from '@opentelemetry/sdk-node';
import {Resource} from '@opentelemetry/resources';
import {ShutdownSignal} from "@nestjs/common";

function setupTelemetry() {
  const sdk = new NodeSDK({
    resource: new Resource({
      'service.name': 'mock-server',
    }),
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('SDK shut down successfully'))
        .catch((error) => console.log('Error shutting down SDK', error))
        .finally(() => process.exit(0));
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks([
    ShutdownSignal.SIGTERM,
    ShutdownSignal.SIGINT,
  ]);

  await SocketIoGateway(WebSocketGateway, app);

  const appConfig = app.get(AppConfig);

  await app.listen(appConfig.port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${appConfig.port}`);
    setupTelemetry();
  });
}
bootstrap().catch(console.error);
