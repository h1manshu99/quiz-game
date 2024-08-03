import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe to automatically validate incoming requests
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS if you're planning to interact with the backend from a different origin
  app.enableCors();

  // Start the application on a specific port
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
