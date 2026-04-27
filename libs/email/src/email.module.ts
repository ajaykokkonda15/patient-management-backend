import { DynamicModule, Global, Module } from "@nestjs/common";
import { EmailProviderFactory } from "./email.factory";
import { EmailService } from "./email.service";
import { EmailModuleOptions } from "./email-options.interface";

@Global()
@Module({})
export class EmailModule {
    static forRootAsync(options: { inject: any[]; useFactory: (...args: any[]) => EmailModuleOptions }): DynamicModule {
        return {
            module: EmailModule,
            providers: [
                {
                    provide: "EMAIL_OPTIONS",
                    inject: options.inject,
                    useFactory: options.useFactory,
                },
                {
                    provide: "EMAIL_PROVIDER",
                    inject: ["EMAIL_OPTIONS"],
                    useFactory: (opts: EmailModuleOptions) => EmailProviderFactory.create(opts),
                },
                EmailService,
            ],
            exports: [EmailService],
        };
    }
}
