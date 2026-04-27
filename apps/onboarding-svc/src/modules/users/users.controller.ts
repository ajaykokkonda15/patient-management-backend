import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";

import { UsersService } from "./users.service";
import { AuthGuard } from "../../guards/auth.guard";
import { ReqUser } from "../../decorators/auth.decorator";
import { UserRoleDto } from "./dto/user-role.dto";
import type { IAuthJwtPayload } from "@app/common";
import { NomiateUserRoleDTO } from "./dto/nominate-user-role.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post("user-role")
    @HttpCode(200)
    @ApiOperation({ summary: "Add User Role to Tenant" })
    @UseGuards(AuthGuard)
    async addUserRole(@ReqUser() user: IAuthJwtPayload, @Body() payload: UserRoleDto) {
        return await this.usersService.addUserRole(user, payload);
    }

    @Post("nominate-user-role")
    @ApiOperation({ summary: "Nomiate a user to a specific role" })
    @UseGuards(AuthGuard)
    @ApiBody({ type: NomiateUserRoleDTO })
    async nominateUserRole(@ReqUser() user: IAuthJwtPayload, @Body() dto: NomiateUserRoleDTO) {
        return await this.usersService.nominateUserRole(user, dto);
    }
}
