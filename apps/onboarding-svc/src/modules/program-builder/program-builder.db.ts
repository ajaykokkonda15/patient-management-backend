import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DbService } from "@app/db";
import { UpdateProgramDto } from "@app/db/dto/update-program.dto";
import { deepDiff, flattenDiffPaths } from "@app/common";

@Injectable()
export class ProgramBuilderDb {
    constructor(private readonly db: DbService) {}

    async getDraftProgramsWithCount(tenantId: number) {
        const result = await this.db.query(
            `
        WITH draft_programs AS (
            SELECT
                p.*,

                json_build_object(
                    'id', u.id,
                    'firstName', u.first_name,
                    'lastName', u.last_name,
                    'middleName', u.middle_name,
                    'email', u.email
                ) AS "createdBy",

                t.industry_sector_code AS "industrySectorCode"

            FROM program p
            JOIN users u ON u.id = p.created_by
            JOIN tenant t ON t.id = p.tenant_id
            WHERE
                p.tenant_id = $1
                AND p.status = 'draft'
                AND p.completed = false
        )
        SELECT
            (SELECT COUNT(*) FROM draft_programs)::int AS count,
            (
                SELECT json_agg(dp ORDER BY dp.updated_at DESC)
                FROM (
                    SELECT *
                    FROM draft_programs
                    ORDER BY updated_at DESC
                    LIMIT 3
                ) dp
            ) AS programs
        `,
            [tenantId],
        );

        return result[0];
    }

    async getProgramInfo(programId: "new" | number, tenantId: number) {
        if (programId === "new") {
            return {};
        }

        if (!Number.isInteger(programId) || programId <= 0) {
            throw new BadRequestException("Invalid program id");
        }

        try {
            const rows = await this.db.query(
                `
            SELECT
                p.id,
                p.name,
                p.status,
                p.completed_step_code,
                p.data,
                p.completed,

                u.first_name,
                u.last_name,
                u.email
                    FROM program p
                    JOIN users u 
                    ON u.id = p.created_by
                    WHERE p.id = $1
                    AND p.tenant_id = $2
            `,
                [programId, tenantId],
            );

            if (!rows.length) {
                throw new NotFoundException("Program not found");
            }

            const r = rows[0];

            return {
                programId: r.id,
                programName: r.name,
                status: r.status,
                completedStepCode: r.completed_step_code,
                data: r.data,
                completed: r.completed,

                createdBy: {
                    firstName: r.first_name,
                    lastName: r.last_name,
                    email: r.email,
                },
            };
        } catch (err) {
            if (err instanceof BadRequestException || err instanceof NotFoundException) {
                throw err;
            }

            console.error("getProgramInfo failed", err);
            throw new InternalServerErrorException("Failed to load program information");
        }
    }

    async updateProgramInfo(programId: "new" | number, tenantId: number, payload: UpdateProgramDto, userId: number) {
        return await this.db.transaction(async (tx) => {
            let oldSnapshot: any = null;
            let newSnapshot: any;
            let action: "create" | "update" | "attest" = programId === "new" ? "create" : "update";

            // --------------------------------------------------
            // 1. Load existing program (for update)
            // --------------------------------------------------
            if (programId !== "new") {
                const rows = await tx.query(`SELECT * FROM program WHERE id = $1 AND tenant_id = $2 LIMIT 1`, [programId, tenantId]);

                if (!rows.length) {
                    throw new NotFoundException("Program not found");
                }

                oldSnapshot = rows[0];
            }

            // --------------------------------------------------
            // 2. Create or Update Program
            // --------------------------------------------------
            if (programId === "new") {
                const [inserted] = await tx.query(
                    `
                INSERT INTO program (
                    tenant_id,
                    name,
                    data,
                    completed_step_code,
                    created_by,
                    status
                )
                VALUES ($1, $2, $3::jsonb, $4, $5, $6)
                RETURNING *
                `,
                    [tenantId, payload.name ?? "Untitled Program", JSON.stringify(payload.data ?? {}), payload.completed_step_code ?? "WELCOME", userId, "draft"],
                );

                newSnapshot = inserted;
                programId = inserted.id;
            } else {
                const fields: string[] = [];
                const values: any[] = [];
                let i = 1;

                const updatableFields: (keyof UpdateProgramDto)[] = ["name", "data", "completed_step_code"];

                for (const field of updatableFields) {
                    if (payload[field] !== undefined) {
                        if (field === "data") {
                            fields.push(`${field} = $${i++}::jsonb`);
                            values.push(JSON.stringify(payload[field]));
                        } else {
                            fields.push(`${field} = $${i++}`);
                            values.push(payload[field]);
                        }
                    }
                }

                // Handle attestation
                // TODO validate attestation data
                if (payload.is_final_step) {
                    fields.push(`status = 'attested'`);
                    action = "attest";
                }

                if (fields.length > 0) {
                    fields.push(`updated_at = now()`);

                    const idIndex = i++;
                    const tenantIndex = i++;

                    values.push(programId, tenantId);

                    const [updated] = await tx.query(
                        `
                    UPDATE program
                    SET ${fields.join(", ")}
                    WHERE id = $${idIndex}
                    AND tenant_id = $${tenantIndex}
                    RETURNING *
                    `,
                        values,
                    );

                    newSnapshot = updated;
                } else {
                    newSnapshot = oldSnapshot;
                }
            }

            // --------------------------------------------------
            // 3. Compute Audit Diff
            // --------------------------------------------------
            const oldData = oldSnapshot
                ? {
                      name: oldSnapshot.name,
                      data: oldSnapshot.data,
                      completed_step_code: oldSnapshot.completed_step_code,
                  }
                : {};

            const newData = {
                name: newSnapshot.name,
                data: newSnapshot.data,
                completed_step_code: newSnapshot.completed_step_code,
            };

            const changedFields = deepDiff(oldData, newData) || {};
            const changedColumns = action === "create" ? [] : flattenDiffPaths(changedFields);
            // --------------------------------------------------
            // 4. Audit Log
            // --------------------------------------------------
            await tx.query(
                `
            INSERT INTO program_audit_log (
                tenant_id,
                program_id,
                old_value,
                new_value,
                changed_fields,
                changed_columns,
                action,
                action_description,
                performed_by
            )
            VALUES (
                $1,
                $2,
                $3::jsonb,
                $4::jsonb,
                $5::jsonb,
                $6,
                $7,
                $8,
                $9
            )
            `,
                [
                    tenantId,
                    programId,
                    JSON.stringify(oldSnapshot ?? {}),
                    JSON.stringify(newSnapshot ?? {}),
                    JSON.stringify(changedFields ?? {}),
                    changedColumns,
                    action,
                    `${action.charAt(0).toUpperCase() + action.slice(1)} Program`,
                    userId,
                ],
            );

            // --------------------------------------------------
            // 5. Response
            // --------------------------------------------------
            return {
                programId: newSnapshot.id,
                name: newSnapshot.name,
                data: newSnapshot.data,
                completedStepCode: newSnapshot.completed_step_code,
                status: newSnapshot.status,
            };
        });
    }
}
