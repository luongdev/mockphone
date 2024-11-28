import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {AppConfig} from "@configs/app.config";
import {SocketIoGateway} from "@modules/socketio/socketio.decorator";
import {WebSocketGateway} from "@nestjs/websockets";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await SocketIoGateway(WebSocketGateway, app);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment
  const appConfig = app.get(AppConfig);


  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
  await app.listen(appConfig.port);
}
bootstrap().catch(console.error);
