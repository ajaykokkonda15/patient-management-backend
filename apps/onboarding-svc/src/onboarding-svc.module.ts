import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_PIPE } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";

import { DbModule } from "@app/db/db.module";
import { validateEnv } from "./env.validate";
import { OnBoardingDB } from "./onboarding-svc.db";
import { OnboardingSvcService } from "./onboarding-svc.service";
import { OnboardingSvcController } from "./onboarding-svc.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ReferenceModule } from "./modules/reference/reference.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { UsersModule } from "./modules/users/users.module";
import { EEmailServiceProvider, EmailModule } from "@app/email";
import { RiskModule } from "./modules/risk-assesment/risk.module";
import { TenantModule } from "./modules/tenant/tenant.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { ProgramBuilderModule } from "./modules/program-builder/program-builder.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
            envFilePath: ["apps/onboarding-svc/.env"],
        }),
        JwtModule.register({ global: true }),
        DbModule.forRoot(),

        EmailModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                provider: EEmailServiceProvider.NODE_MAILER,
                nodemailer: {
                    host: config.getOrThrow<string>("SMTP_HOST"),
                    port: config.getOrThrow<number>("SMTP_PORT"),
                    secure: config.getOrThrow<boolean>("SMTP_SECURE"),
                    user: config.getOrThrow<string>("SMTP_USER"),
                    pass: config.getOrThrow<string>("SMTP_PASS"),
                    from: config.getOrThrow<string>("SMTP_FROM"),
                },
            }),
        }),

        AuthModule,
        ReferenceModule,
        ProfileModule,
        UsersModule,
        RiskModule,
        TenantModule,
        DashboardModule,
        ProgramBuilderModule,
    ],
    controllers: [OnboardingSvcController],
    providers: [
        OnboardingSvcService,
        OnBoardingDB,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        },
    ],
})
export class OnboardingSvcModule {}
