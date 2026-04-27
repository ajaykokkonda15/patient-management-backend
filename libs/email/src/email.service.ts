import { Inject, Injectable } from "@nestjs/common";
import { type EmailProvider, IEmailSendOptions } from "./providers/email-provider.interface";

@Injectable()
export class EmailService {
    constructor(
        @Inject("EMAIL_PROVIDER")
        private readonly provider: EmailProvider,
    ) {}

    sendMail(options: IEmailSendOptions) {
        return this.provider.send(options);
    }
}
