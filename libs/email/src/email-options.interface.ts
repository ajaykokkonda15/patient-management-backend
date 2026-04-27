export enum EEmailServiceProvider {
    NODE_MAILER = "nodemailer",
}

export interface EmailModuleOptions {
    provider: EEmailServiceProvider;
    nodemailer?: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        from: string;
    };
}
