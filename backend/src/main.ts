import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://chat-bee-one.vercel.app/login'    
    ],
    credentials: true,
  });

  app.enableShutdownHooks();
  
  await app.listen(process.env.PORT ?? 5000); 
  
}
bootstrap();
