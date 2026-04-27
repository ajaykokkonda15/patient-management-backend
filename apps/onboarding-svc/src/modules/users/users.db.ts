import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { DbService } from "@app/db";
import { IJwtPayload } from "@app/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { NomiateUserRoleDTO } from "./dto/nominate-user-role.dto";
import { EmailService } from "@app/email";

@Injectable()
export class UsersDB {
    constructor(
        private readonly db: DbService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
    ) {}

    async addUserRole({ userId, tenantId, roleCode }: { userId: number; tenantId: number; roleCode: string }) {
        /**
         * 1) Validate tenant_user exists
         */
        const [tenantUser] = await this.db.query(
            `
            SELECT id
            FROM tenant_user
            WHERE user_id = $1
              AND tenant_id = $2
            `,
            [userId, tenantId],
        );

        if (!tenantUser) {
            throw new NotFoundException(`User ${userId} is not part of tenant ${tenantId}`);
        }

        /**
         * 2) Validate role exists
         */
        const [role] = await this.db.query(
            `
            SELECT code
            FROM roles
            WHERE code = $1
            `,
            [roleCode],
        );

        if (!role) {
            throw new NotFoundException(`Role "${roleCode}" does not exist`);
        }

        /**
         * 3) Insert role assignment
         */
        const [row] = await this.db.query(
            `
            INSERT INTO tenant_user_roles (tenant_user_id, role_code)
            VALUES ($1, $2)
            ON CONFLICT (tenant_user_id, role_code) DO NOTHING
            RETURNING id, tenant_user_id, role_code
            `,
            [tenantUser.id, role.code],
        );

        /**
         * 4) Detect duplicate (already assigned)
         */
        if (!row) {
            throw new ConflictException(`User already has role "${roleCode}" in this tenant`);
        }

        return row;
    }

    async nominateUserRole(tenantId: number, dto: NomiateUserRoleDTO) {
        return this.db.transaction(async (tx) => {
            /**
             * 1. Create or get user
             */
            // TODO check if user already exists then send relation invitation
            const parts = dto.fullName.trim().split(/\s+/);
            const firstName = parts[0];
            const lastName = parts.slice(1).join(" ");

            const [user] = await tx.query(
                `
                    INSERT INTO users (email, first_name, last_name)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (email)
                    DO UPDATE SET email = EXCLUDED.email
                    RETURNING id, email
                `,
                [dto.email, firstName, lastName],
            );

            const userId = user.id;

            /**
             * 2. Get role
             */
            const [role] = await tx.query(`SELECT code, description
                                FROM roles
                                WHERE code = '${dto.roleCode}'
                                LIMIT 1`);

            if (!role) throw new Error("Role not found");

            /**
             * 3. Generate JWT signup token
             */
            const jwtPayload: IJwtPayload = {
                userId,
                email: dto.email,
            };

            const token = await this.jwtService.signAsync(jwtPayload, {
                // expiresIn: "1d",
                algorithm: "HS512",
                secret: this.configService.getOrThrow<string>("JWT_SECRET"),
            });

            const signupUrl = `${this.configService.getOrThrow<string>("APP_DOMAIN")}/signup?token=${token}`;

            await this.emailService.sendMail({
                to: dto.email,
                subject: "Accept your invitaion as Compliance Officer",
                html: `
                    <h2>Hello ${dto.fullName}</h2>
                    <p>Click the link below to accept your invitaion as Compliance Officer</p>
                    <a href="${signupUrl}">
                    Accept
                    </a>
                `,
            });

            /**
             * 4. Create tenant_user
             */
            const [tenantUser] = await tx.query(
                `
                INSERT INTO tenant_user (user_id, tenant_id, signup_link, is_active)
                VALUES ($1, $2, $3, false)
                ON CONFLICT (user_id, tenant_id)
                DO UPDATE SET signup_link = EXCLUDED.signup_link
                RETURNING id
                `,
                [userId, tenantId, signupUrl],
            );

            const tenantUserId = tenantUser.id;

            /**
             * 5. Assign Compliance Officer role
             */
            await tx.query(
                `
                INSERT INTO tenant_user_roles (tenant_user_id, role_code)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
                `,
                [tenantUserId, role.code],
            );

            return {
                message: "Invitation sent!",
            };
        });
    }
}
