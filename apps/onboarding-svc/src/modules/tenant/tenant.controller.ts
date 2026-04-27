import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";

import { TenantService } from "./tenant.service";
import { AuthGuard } from "../../guards/auth.guard";
import { ReqUser } from "../../decorators/auth.decorator";
import type { IAuthJwtPayload } from "@app/common";
import { CreateTenantDTO } from "./dto/create-tenant.dto";

@ApiTags("tenant")
@Controller("tenant")
export class TenantController {
    constructor(private readonly tenantService: TenantService) {}

    @Get("users")
    @HttpCode(200)
    @ApiOperation({ summary: "Get Tenant Users" })
    @UseGuards(AuthGuard)
    // TODO Add query params to filter pagination and validate RBAC
    async getTenantUsers(@ReqUser() user: IAuthJwtPayload) {
        return await this.tenantService.getTenantUsers(user);
    }

    @Post("create")
    @HttpCode(201)
    // TODO: Authentication to be added later
    @ApiOperation({ summary: "Create tenant" })
    @ApiBody({ type: CreateTenantDTO })
    async createTenant(@Body() createTenantDto: CreateTenantDTO): Promise<Record<string, string>> {
        return await this.tenantService.createTenantUser(createTenantDto);
    }
}
