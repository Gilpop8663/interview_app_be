import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://unfolloweasy.com',
      'https://www.unfolloweasy.com',
      'chrome-extension://iabkmaonokgjbojbnmklpjpdibelfhef',
      'chrome-extension://limbfnbadjaoikobmelblpgmlpfnngec',
      'chrome-extension://pdoboaikbndgcceiefchkgabnahjjiab',
    ], // 클라이언트의 origin을 여기에 설정,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true, // 인증 정보를 전달할 수 있도록 설정 (옵션)
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
