import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'https://myfrontend.com'], // allowed origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // allowed methods
    credentials: true, // allow cookies/auth headers
  });

  // Optionally prefix all routes with /api
  app.setGlobalPrefix('api');
  
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
  const serverUrl = await app.getUrl();
  console.log(`🚀 Application is running at: ${serverUrl}`);
}
bootstrap();
