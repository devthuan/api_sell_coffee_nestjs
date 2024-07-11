import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1')

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 180000,  // 3 minutes
        
      },
    })
  )

  // using pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }))

  await app.listen(process.env.APP_PORT || 80);
}
bootstrap();
