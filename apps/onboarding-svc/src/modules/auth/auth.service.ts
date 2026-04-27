import { Injectable, UnauthorizedException } from "@nestjs/common";

import { AuthDB } from "./auth.db";
import { IAuthJwtPayload } from "@app/common/common.interfaces";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
    constructor(private readonly authDB: AuthDB) {}

    async login(dto: LoginDto) {
        return await this.authDB.login(dto);
    }

    async validateUser(user: IAuthJwtPayload) {
        return await this.authDB.validateUser(user);
    }

    async updatePassword(user: IAuthJwtPayload, dto: UpdatePasswordDto) {
        if (user.email !== dto.email) {
            throw new UnauthorizedException("Email mismatch");
        }

        await this.authDB.updatePassword(user, dto.password);
        return { message: "Password updated successfully" };
    }
}
