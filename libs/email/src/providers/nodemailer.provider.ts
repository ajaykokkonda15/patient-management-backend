import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { EmailProvider, IEmailSendOptions } from "./email-provider.interface";

@Injectable()
export class NodemailerProvider implements EmailProvider {
    private transporter: nodemailer.Transporter;
    private from: string;

    constructor(config: { host: string; port: number; secure: boolean; user: string; pass: string; from: string }) {
        this.from = config.from;

        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });
    }

    async send(options: IEmailSendOptions): Promise<void> {
        await this.transporter.sendMail({
            from: this.from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });
    }
}
