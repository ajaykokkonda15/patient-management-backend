import { Injectable } from "@nestjs/common";
import { DbService } from "@app/db";
import { IJwtPayload } from "@app/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CreateTenantDTO } from "./dto/create-tenant.dto";

@Injectable()
export class TenantDB {
    constructor(
        private readonly db: DbService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async getTenantUsers(tenantId: number) {
        const query = `
                SELECT
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.is_active,
                    COALESCE(
                        json_agg(r.description) 
                        FILTER (WHERE r.description IS NOT NULL),
                        '[]'
                    ) AS roles
                FROM tenant_user tu
                JOIN users u 
                    ON u.id = tu.user_id
                LEFT JOIN tenant_user_roles tur 
                    ON tur.tenant_user_id = tu.id
                LEFT JOIN roles r 
                    ON r.code = tur.role_code
                WHERE tu.tenant_id = $1
                GROUP BY u.id;
            `;

        const { rows } = await this.db.query(query, [tenantId]);

        return rows.map((r: any) => ({
            userId: r.id,
            firstName: r.first_name,
            lastName: r.last_name,
            email: r.email,
            isActive: r.is_active,
            roles: r.roles,
        }));
    }

    async createTenantUser(dto: CreateTenantDTO): Promise<{ signupUrl: string }> {
        return this.db.transaction(async (tx) => {
            const { email, abn, legalEntityName } = dto;

            const adminRoleCode = "ADMIN";

            // 1️⃣ Ensure Admin role exists
            const roleExists = await tx.query(`SELECT 1 FROM roles WHERE code = $1 LIMIT 1`, [adminRoleCode]);
            if (!roleExists.length) {
                throw new Error("Admin role not configured");
            }

            // 2️⃣ Get or create user + detect if new
            const [user] = await tx.query(
                `
                        INSERT INTO users (email)
                        VALUES ($1)
                        ON CONFLICT (email) DO UPDATE
                            SET email = EXCLUDED.email
                        RETURNING id, (xmax = 0) AS is_new
                    `,
                [email],
            );

            const userId = user.id;
            const isNewUser = user.is_new;

            // 3️⃣ Create tenant
            const [tenant] = await tx.query(
                `
                        INSERT INTO tenant (abn, legal_entity_name, owner_id)
                        VALUES ($1, $2, $3)
                        RETURNING id
                    `,
                [abn, legalEntityName, userId],
            );

            const tenantId = tenant.id;

            // 4️⃣ Link user to tenant
            const [tenantUser] = await tx.query(
                `
                        INSERT INTO tenant_user (user_id, tenant_id)
                        VALUES ($1, $2)
                        ON CONFLICT (user_id, tenant_id) DO UPDATE
                            SET user_id = EXCLUDED.user_id
                        RETURNING id
                    `,
                [userId, tenantId],
            );

            const tenantUserId = tenantUser.id;

            // 5️⃣ Assign Admin role
            await tx.query(
                `
                        INSERT INTO tenant_user_roles (tenant_user_id, role_code)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `,
                [tenantUserId, adminRoleCode],
            );

            // 6️⃣ Generate JWT
            const jwtPayload: IJwtPayload = {
                userId,
                email,
            };

            const token = await this.jwtService.signAsync(jwtPayload, {
                algorithm: "HS512",
                secret: this.configService.getOrThrow<string>("JWT_SECRET"),
            });

            // 7️⃣ Pick correct signup URL
            const base = this.configService.getOrThrow<string>("APP_DOMAIN");

            const signupUrl = isNewUser ? `${base}/signup?token=${token}&tenantId=${tenantId}` : `${base}/signup/organisation-setup?token=${token}&tenantId=${tenantId}&isNew=true`;

            return { signupUrl };
        });
    }
}
