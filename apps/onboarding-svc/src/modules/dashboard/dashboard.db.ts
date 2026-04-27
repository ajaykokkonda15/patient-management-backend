import { IAuthJwtPayload } from "@app/common";
import { DbService } from "@app/db";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class DashboardDB {
    constructor(private readonly db: DbService) {}

    async getDashboardData(user: IAuthJwtPayload) {
        const { email, tenantId } = user;
        // TODO send sidebar details based on roles
        // TODO send the remaining dashboard data
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
}
