import { VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import helmet from "helmet";

import { OnboardingSvcModule } from "./onboarding-svc.module";

async function bootstrap() {
  const app = await NestFactory.create(OnboardingSvcModule, { cors: true });

  app.use(helmet());
  app.enableVersioning({ type: VersioningType.URI });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Documentation")
    .setDescription("APIs")
    .addBearerAuth({ type: "http" }, "onboarding-svc-auth")
    .setVersion("1.0")
    .build();

  SwaggerModule.setup(
    "/docs",
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
    {
      explorer: true,
      swaggerOptions: {
        docExpansion: "none",
        filter: true,
        showRequestDuration: true,
      },
    }
  );

  const configService = app.get(ConfigService);
  const PORT = +configService.get("PORT") || 3000;
  const DOMAIN = configService.get("DOMAIN");

  await app.listen(PORT);
  console.log(`🚀🚀 Client - Onboarding service is running on ${PORT} 🚀🚀`);
  console.log(`Swagger Docs Link - ${DOMAIN}/docs`);
}

bootstrap();
