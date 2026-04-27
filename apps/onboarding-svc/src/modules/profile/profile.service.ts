import { Injectable } from "@nestjs/common";
import { ProfileDB } from "./profile.db";
import { IAuthJwtPayload } from "@app/common";
import { UserDto } from "@app/db/dto/user.dto";
import { UpdateTenantDto } from "@app/db/dto/update-tenant.dto";

@Injectable()
export class ProfileService {
    constructor(private readonly profileDb: ProfileDB) {}

    async getTenantProfile(user: IAuthJwtPayload) {
        const tenant = await this.profileDb.getTenantById(+user.tenantId);
        delete tenant.id;
        delete tenant.created_at;
        delete tenant.updated_at;
        return tenant;
    }

    async getUserProfile(user: IAuthJwtPayload) {
        return await this.profileDb.getUserById(+user.userId);
    }

    async updateTenantProfile(user: IAuthJwtPayload, payload: UpdateTenantDto) {
        // TODO: Only admin can update or anyone else can also?
        return await this.profileDb.updateTenant(+user.tenantId, payload, +user.userId);
    }

    async updateUser(user: IAuthJwtPayload, payload: UserDto) {
        // TODO DAO only user can update his user info or anyone else has access to
        return await this.profileDb.updateUser(user.userId, payload);
    }
}
