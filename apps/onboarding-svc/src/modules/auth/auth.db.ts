import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";

import { DbService } from "@app/db";
import { LoginDto } from "./dto/login.dto";
import { comparePassword, hashPassword, IAuthJwtPayload, IJwtPayload } from "@app/common";

@Injectable()
export class AuthDB {
    constructor(
        private readonly db: DbService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async login(dto: LoginDto) {
        const { email, password, rememberMe = false } = dto;

        // 1️ Load user + credentials
        const userRows = await this.db.query(
            `
        SELECT
            u.id,
            u.email,
            u.first_name,
            u.last_name,
            u.is_active,
            uc.password AS password_hash
        FROM users u
        JOIN user_credentials uc ON uc.user_id = u.id
        WHERE u.email = $1
        `,
            [email],
        );

        if (!userRows.length) {
            throw new UnauthorizedException("Invalid email or password");
        }

        const user = userRows[0];
        // TODO check user active status
        // if (!user.is_active) {
        //     throw new UnauthorizedException("Account disabled");
        // }

        // 2️ Validate password
        const isValid = await comparePassword(password, user.password_hash);
        if (!isValid) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // 3️ Load tenants + tenant_user_roles
        const rows = await this.db.query(
            `
        SELECT
            t.id                AS tenant_id,
            t.legal_entity_name AS tenant_name,
            r.code              AS role_code,
            r.description       AS role_description
        FROM tenant_user tu
        JOIN tenant t ON t.id = tu.tenant_id
        LEFT JOIN tenant_user_roles tur ON tur.tenant_user_id = tu.id
        LEFT JOIN roles r ON r.code = tur.role_code
        WHERE tu.user_id = $1
        `,
            [user.id],
        );

        // TODO Check if user is active

        if (!rows.length) {
            throw new ForbiddenException("User is not assigned to any tenant");
        }

        // 4️ Group tenants & roles
        const tenantMap = new Map<
            number,
            {
                tenantId: number;
                tenantName: string;
                roles: { code: string; description: string }[];
            }
        >();

        for (const row of rows) {
            if (!tenantMap.has(row.tenant_id)) {
                tenantMap.set(row.tenant_id, {
                    tenantId: row.tenant_id,
                    tenantName: row.tenant_name,
                    roles: [],
                });
            }

            if (row.role_code) {
                tenantMap.get(row.tenant_id)!.roles.push({
                    code: row.role_code,
                    description: row.role_description,
                });
            }
        }

        const tenants = Array.from(tenantMap.values());

        // 5️ User-scoped JWT (no tenant, no roles)
        const jwtPayload: IJwtPayload = {
            userId: user.id,
            email: user.email,
        };

        const token = await this.jwtService.signAsync(jwtPayload, {
            expiresIn: rememberMe ? "5d" : "1d",
            algorithm: "HS512",
            secret: this.configService.getOrThrow<string>("JWT_SECRET"),
        });

        // 6 Send the response
        return {
            user: {
                userId: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                token,
                tenants,
            },
        };
    }

    async validateUser(user: IAuthJwtPayload) {
        const { email, tenantId } = user;

        const sql = `
            WITH u AS (
                SELECT id, email, first_name, last_name
                FROM users
                WHERE email = $1
            ),
            t AS (
                SELECT id, legal_entity_name
                FROM tenant
                WHERE id = $2
            ),
            tu AS (
                SELECT tu.id, tu.user_id, tu.tenant_id
                FROM tenant_user tu
                JOIN u ON u.id = tu.user_id
                JOIN t ON t.id = tu.tenant_id
            ),
            roles AS (
                SELECT 
                    tur.tenant_user_id,
                    r.code,
                    r.description
                FROM tenant_user_roles tur
                JOIN roles r ON r.code = tur.role_code
                JOIN tu ON tu.id = tur.tenant_user_id
            )
            SELECT
                u.id             AS user_id,
                u.email,
                u.first_name,
                u.last_name,
                t.id             AS tenant_id,
                t.legal_entity_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'code', roles.code,
                            'description', roles.description
                        )
                    ) FILTER (WHERE roles.code IS NOT NULL),
                    '[]'
                ) AS roles
            FROM u
            JOIN t ON TRUE
            JOIN tu ON TRUE
            LEFT JOIN roles ON roles.tenant_user_id = tu.id
            GROUP BY u.id, u.email, u.first_name, u.last_name, t.id, t.legal_entity_name;
        `;

        const rows = await this.db.query(sql, [email, tenantId]);

        if (!rows.length) {
            throw new UnauthorizedException("User not found");
        }

        const row = rows[0];

        return {
            user: {
                userId: row.user_id,
                email: row.email,
                firstName: row.first_name,
                lastName: row.last_name,
                tenants: [
                    {
                        tenantId: row.tenant_id,
                        tenantName: row.legal_entity_name,
                        roles: row.roles, // {code, description}[]
                    },
                ],
            },
        };
    }

    async updatePassword(user: IAuthJwtPayload, password: string) {
        await this.db.transaction(async (tx) => {
            // 1. Verify the user exists in this tenant
            const userCheck = await tx.query(
                `
                SELECT u.id
                FROM users u
                JOIN tenant_user tu ON tu.user_id = u.id
                WHERE u.id = $1
                AND tu.tenant_id = $2
            `,
                [user.userId, user.tenantId],
            );

            if (userCheck.rowCount === 0) {
                throw new Error("User not found");
            }

            // 2. Fetch last password hash
            const lastPassword = await tx.query(
                `
                SELECT password
                FROM user_credentials
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT 1
            `,
                [user.userId],
            );

            // 3. Prevent password reuse
            if (lastPassword.rowCount > 0) {
                const same = await comparePassword(password, lastPassword.rows[0].password);

                if (same) {
                    throw new Error("You cannot reuse your previous password");
                }
            }

            // 4. Hash new password
            const hashed = await hashPassword(password);
            await tx.query(
                `
                INSERT INTO user_credentials (user_id, password)
                VALUES ($1, $2)
            `,
                [user.userId, hashed],
            );
        });
    }
}
