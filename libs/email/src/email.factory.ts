import { EEmailServiceProvider, EmailModuleOptions } from "./email-options.interface";
import { EmailProvider } from "./providers/email-provider.interface";
import { NodemailerProvider } from "./providers/nodemailer.provider";

export class EmailProviderFactory {
    static create(options: EmailModuleOptions): EmailProvider {
        switch (options.provider) {
            case EEmailServiceProvider.NODE_MAILER:
                if (!options.nodemailer) {
                    throw new Error("Nodemailer config missing");
                }
                return new NodemailerProvider(options.nodemailer);

            default:
                throw new Error(`Unsupported email provider: ${options.provider}`);
        }
    }
}
