import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, HttpCode, Patch, Put, UseGuards } from "@nestjs/common";

import { UserDto } from "@app/db/dto/user.dto";
import type { IAuthJwtPayload } from "@app/common";
import { ProfileService } from "./profile.service";
import { AuthGuard } from "../../guards/auth.guard";
import { ReqUser } from "../../decorators/auth.decorator";
import { UpdateTenantDto } from "@app/db/dto/update-tenant.dto";

@ApiTags("profile")
@Controller("profile")
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get("/tenant")
    @HttpCode(200)
    @ApiOperation({ summary: "Get Tenant Profile" })
    @UseGuards(AuthGuard)
    async getTenantProfile(@ReqUser() user: IAuthJwtPayload) {
        return await this.profileService.getTenantProfile(user);
    }

    @Patch("/tenant")
    @HttpCode(200)
    @ApiOperation({ summary: "Update Tenant Profile" })
    @UseGuards(AuthGuard)
    @ApiBody({ type: UpdateTenantDto })
    async updateTenantProfile(@ReqUser() user: IAuthJwtPayload, @Body() payload: UpdateTenantDto) {
        return await this.profileService.updateTenantProfile(user, payload);
    }

    @Get("/user")
    @HttpCode(200)
    @ApiOperation({ summary: "Get User Profile" })
    @UseGuards(AuthGuard)
    async getUserProfile(@ReqUser() user: IAuthJwtPayload) {
        return await this.profileService.getUserProfile(user);
    }

    @Patch("/user")
    @HttpCode(200)
    @ApiOperation({ summary: "Update User Profile" })
    @UseGuards(AuthGuard)
    @ApiBody({ type: UserDto })
    async updateUserProfile(@ReqUser() user: IAuthJwtPayload, @Body() payload: UserDto) {
        return await this.profileService.updateUser(user, payload);
    }
}
