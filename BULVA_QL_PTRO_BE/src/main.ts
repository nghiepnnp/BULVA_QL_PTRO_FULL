import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FileLogger } from './common/logger/file.logger.js';
import cookieParser from 'cookie-parser';

const applicationLogger = new FileLogger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    logger: applicationLogger,
    // snapshot: true,
  });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/v1', { exclude: [''] });

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fullstack YouTube Clone API')
    .setDescription('API documentation for the NestJS backend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'docs-json',
  });

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  applicationLogger.log(`Application running in port: ${port}`, 'Bootstrap');
  applicationLogger.log(
    `Swagger UI: http://localhost:${port}/swagger`,
    'Bootstrap',
  );
}

void bootstrap().catch((error: unknown) => {
  applicationLogger.fatal(error, 'Bootstrap');
  process.exitCode = 1;
});
