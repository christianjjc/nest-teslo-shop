import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.enableCors();
  app.enableCors({
    // origin: ['https://betterjavacode.com', 'https://www.google.com'],
    // methods: ['POST', 'PATCH', 'DELETE', 'GET'],
  });

  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    //*swagger
    .setTitle('Teslo RESTFul API')
    .setDescription('Teslo Shop Endpoints')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
  logger.log(`App Running on Port: ${process.env.PORT}`);
}
bootstrap();

//! CORS OPTIONS
//* Configuring CORS Options
//* Optionally, you can pass configuration options to the enableCors() method to customize the CORS behavior.
//* The available configuration options include:

//? origin: A string or an array of strings representing allowed origins.
//* methods: A string or an array of strings representing allowed HTTP methods.
//? allowedHeaders: A string or an array of strings representing allowed headers.
//* exposedHeaders: A string or an array of strings representing headers exposed to the client.
//? credentials: A boolean value indicating whether to include credentials in the request (e.g., cookies, HTTP authentication).
//* maxAge: A number representing the maximum age of the preflight request (in seconds).

/*
 //* async enableCors() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: 'https://example.com',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400,
    });
  }
*/
