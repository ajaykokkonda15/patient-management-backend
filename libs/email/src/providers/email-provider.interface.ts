export interface IEmailSendOptions {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}

export interface EmailProvider {
    send(options: IEmailSendOptions): Promise<void>;
}
