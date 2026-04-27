import { Injectable } from "@nestjs/common";

import { UsersDB } from "./users.db";
import { IAuthJwtPayload } from "@app/common";
import { UserRoleDto } from "./dto/user-role.dto";
import { NomiateUserRoleDTO } from "./dto/nominate-user-role.dto";

@Injectable()
export class UsersService {
    constructor(private readonly usersDB: UsersDB) {}

    async addUserRole(user: IAuthJwtPayload, payload: UserRoleDto) {
        const dbPayload = {
            userId: payload.userId || user.userId,
            tenantId: payload.tenantId || user.tenantId,
            roleCode: payload.roleCode,
        };

        return await this.usersDB.addUserRole(dbPayload);
    }

    async nominateUserRole(user: IAuthJwtPayload, dto: NomiateUserRoleDTO) {
        return await this.usersDB.nominateUserRole(user.tenantId, dto);
    }
}
