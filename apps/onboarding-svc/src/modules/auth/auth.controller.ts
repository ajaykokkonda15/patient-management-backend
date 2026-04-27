import { Controller, Post, Body, HttpCode, UseGuards, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { AuthGuard } from "../../guards/auth.guard";
import { ReqUser } from "../../decorators/auth.decorator";

import { LoginDto } from "./dto/login.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";

import type { IAuthJwtPayload } from "@app/common/common.interfaces";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("login")
    @HttpCode(200)
    @ApiOperation({ summary: "Login with email and password" })
    @ApiBody({ type: LoginDto })
    async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto);
    }

    @Get("validate-user")
    @HttpCode(200)
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Signup" })
    async signup(@ReqUser() user: IAuthJwtPayload) {
        // TODO: Check if user already signed up
        return this.authService.validateUser(user);
    }

    @Post("update-password")
    @ApiOperation({ summary: "Update Password" })
    @ApiBody({ type: UpdatePasswordDto })
    @UseGuards(AuthGuard)
    async updatePassword(@ReqUser() user: IAuthJwtPayload, @Body() updatePasswordDto: UpdatePasswordDto) {
        return await this.authService.updatePassword(user, updatePasswordDto);
    }
}
