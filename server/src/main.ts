import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {AppConfig} from "@configs/app.config";
import {SocketIoGateway} from "@modules/socketio/socketio.decorator";
import {WebSocketGateway} from "@nestjs/websockets";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  await SocketIoGateway(WebSocketGateway, app);

  const appConfig = app.get(AppConfig);

  await app.listen(appConfig.port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${appConfig.port}`);
  });
}
bootstrap().catch(console.error);
