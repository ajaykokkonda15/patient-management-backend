import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { DbService } from "@app/db";
import { deepDiff } from "@app/common";
import { UserDto } from "@app/db/dto/user.dto";
import { UpdateTenantDto } from "@app/db/dto/update-tenant.dto";

@Injectable()
export class ProfileDB {
    constructor(private readonly db: DbService) {}

    async getTenantById(tenantId: number) {
        if (!Number.isInteger(tenantId) || tenantId <= 0) {
            throw new BadRequestException("Invalid Request");
        }

        const rows = await this.db.query(
            `SELECT *
            FROM tenant
            WHERE id = $1
            LIMIT 1`,
            [tenantId],
        );

        if (!rows || !rows[0]) {
            throw new NotFoundException("Organisation details not found!");
        }

        return rows[0];
    }

    async getUserById(userId: number) {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new BadRequestException("Invalid Request");
        }

        const sql = `
            SELECT
                u.id AS user_id,
                u.first_name,
                u.last_name,
                u.email,
                COALESCE(
                    JSONB_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'tenantId', t.id,
                            'tenantName', t.legal_entity_name,
                            'roles', COALESCE(tr.roles, '[]'::jsonb)
                        )
                    ) FILTER (WHERE t.id IS NOT NULL),
                    '[]'::jsonb
                ) AS tenants

            FROM users u
            LEFT JOIN tenant_user tu ON tu.user_id = u.id
            LEFT JOIN tenant t ON t.id = tu.tenant_id
            LEFT JOIN (
                SELECT
                    tur.tenant_user_id,
                    JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                            'code', r.code,
                            'description', r.description
                        )
                    ) AS roles
                FROM tenant_user_roles tur
                JOIN roles r ON r.code = tur.role_code
                GROUP BY tur.tenant_user_id
            ) tr ON tr.tenant_user_id = tu.id

            WHERE u.id = $1
            GROUP BY u.id;
        `;

        const result = await this.db.query(sql, [userId]);

        // Works for pg, knex, typeorm, neon, etc
        const rows = Array.isArray(result) ? result : result?.rows;

        if (!rows || rows.length === 0) {
            throw new ForbiddenException("User not found");
        }

        const row = rows[0];

        return {
            user: {
                userId: row.user_id,
                firstName: row.first_name,
                lastName: row.last_name,
                email: row.email,
                tenants: row.tenants,
            },
        };
    }

    async updateTenant(tenantId: number, payload: UpdateTenantDto, userId: number) {
        return await this.db.transaction(async (tx) => {
            // 1 Get current tenant state for diffing
            const [oldSnapshot] = await tx.query(`SELECT * FROM tenant WHERE id = $1`, [tenantId]);

            if (!oldSnapshot) {
                throw new NotFoundException("Tenant not found");
            }

            // 2 Identify changes using deepDiff
            const fieldsToUpdate = [
                "legal_entity_name",
                "abn",
                "trading_name",
                "address",
                "austrac_id",
                "legal_structure_code",
                "industry_sector_code",
                "designated_service_codes",
                "employees_band_code",
                "annual_revenue_band_code",
                "no_of_offices",
                "customer_type_codes",
            ];

            const oldData: Partial<UpdateTenantDto> = {};
            const newData: Partial<UpdateTenantDto> = {};

            fieldsToUpdate.forEach((field) => {
                if (payload[field] !== undefined) {
                    let normalizedNewVal = payload[field];

                    // Normalization (if not handled by DTO transformer)
                    if (field === "austrac_id" && typeof payload[field] === "string") {
                        normalizedNewVal = payload[field].replace(/\D/g, "");
                    }

                    oldData[field] = oldSnapshot[field];
                    newData[field] = normalizedNewVal;
                }
            });

            const changedFields = deepDiff(oldData, newData) || {};
            const changedColumns = Object.keys(changedFields);

            if (changedColumns.length === 0) {
                return oldSnapshot;
            }

            // 3 Build UPDATE query
            const fields: string[] = [];
            const values: any[] = [];

            changedColumns.forEach((col) => {
                values.push(changedFields[col]);
                fields.push(`${col} = $${values.length}`);
            });

            fields.push(`updated_at = now()`);

            // 4 Compute setup completion
            const s = {
                legal_structure_code: payload.legal_structure_code ?? oldSnapshot.legal_structure_code,
                industry_sector_code: payload.industry_sector_code ?? oldSnapshot.industry_sector_code,
                designated_service_codes: payload.designated_service_codes ?? oldSnapshot.designated_service_codes,
                employees_band_code: payload.employees_band_code ?? oldSnapshot.employees_band_code,
                annual_revenue_band_code: payload.annual_revenue_band_code ?? oldSnapshot.annual_revenue_band_code,
                no_of_offices: payload.no_of_offices ?? oldSnapshot.no_of_offices,
            };

            const isSetupComplete =
                !!s.legal_structure_code &&
                !!s.industry_sector_code &&
                Array.isArray(s.designated_service_codes) &&
                s.designated_service_codes.length > 0 &&
                !!s.employees_band_code &&
                !!s.annual_revenue_band_code &&
                !!s.no_of_offices;

            values.push(isSetupComplete);
            fields.push(`is_setup_complete = $${values.length}`);

            // 5 Execute Update
            values.push(tenantId);
            const updateSql = `
                UPDATE tenant
                SET ${fields.join(", ")}
                WHERE id = $${values.length}
                RETURNING *
            `;

            const [newSnapshot] = await tx.query(updateSql, values);

            // 6 Audit Log
            await tx.query(
                `
                INSERT INTO tenant_audit_log (
                    tenant_id, 
                    old_value, 
                    new_value, 
                    changed_fields, 
                    changed_columns, 
                    action, 
                    action_description, 
                    performed_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
                [tenantId, JSON.stringify(oldSnapshot ?? {}), JSON.stringify(newSnapshot ?? {}), JSON.stringify(changedFields ?? {}), changedColumns, "update", "Updated Organisation Details", userId],
            );

            return newSnapshot;
        });
    }

    async updateUser(userId: number, payload: UserDto) {
        // Map DTO fields to DB columns if needed
        const columnMap: Record<string, string> = {
            firstName: "first_name",
            middleName: "middle_name",
            lastName: "last_name",
            email: "email",
            isActive: "is_active",
        };

        const fields: string[] = [];
        const values: any[] = [];
        let i = 1;

        for (const [key, value] of Object.entries(payload)) {
            if (value) {
                const column = columnMap[key];
                fields.push(`${column} = $${i++}`);
                values.push(value);
            }
        }

        if (!fields.length) {
            return null;
        }

        const [updated] = await this.db.query(
            `
        UPDATE users
        SET ${fields.join(", ")},
            updated_at = NOW()
        WHERE id = $${i}
        RETURNING 
            id,
            first_name,
            middle_name,
            last_name,
            email,
            is_active,
            updated_at
        `,
            [...values, userId],
        );

        return updated;
    }
}
