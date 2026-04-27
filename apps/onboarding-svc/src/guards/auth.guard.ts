import { IJwtPayload } from "@app/common";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();

        const authHeader = req.headers["authorization"];
        const tenantId = req.headers["x-tenant-id"]?.toString();

        if (!tenantId) {
            throw new UnauthorizedException("Un-Authorized Access (Missing Tenant ID)");
        }

        const token = (authHeader && authHeader.split(" ")[1]) || authHeader;

        if (!token) {
            throw new UnauthorizedException("Un-Authorized Access (Missing accessToken)");
        }

        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: this.configService.getOrThrow<string>("JWT_SECRET"),
            });

            const { userId, email }: IJwtPayload = decoded;

            if (!userId || !email) {
                throw new UnauthorizedException("Invalid token payload");
            }

            req["user"] = { ...decoded, token, tenantId: +tenantId };
        } catch (err) {
            throw new UnauthorizedException("Invalid or Expired Token");
        }

        return true;
    }
}
