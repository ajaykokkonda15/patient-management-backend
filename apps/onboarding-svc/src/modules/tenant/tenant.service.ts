import { Injectable } from "@nestjs/common";

import { TenantDB } from "./tenant.db";
import { IAuthJwtPayload } from "@app/common";
import { CreateTenantDTO } from "./dto/create-tenant.dto";

@Injectable()
export class TenantService {
    constructor(private readonly tenantDB: TenantDB) {}

    async getTenantUsers(user: IAuthJwtPayload) {
        return await this.tenantDB.getTenantUsers(user.tenantId);
    }

    async createTenantUser(tenantDto: CreateTenantDTO): Promise<Record<string, string>> {
        return await this.tenantDB.createTenantUser(tenantDto);
    }
}
