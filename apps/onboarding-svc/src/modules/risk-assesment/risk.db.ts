import { Injectable } from "@nestjs/common";

import { DbService } from "@app/db";

type TenantMetricRow = {
    tenant_id: number;
    metric_code: string;
    value: number;
};

@Injectable()
export class RiskDB {
    constructor(private readonly db: DbService) {}

    async getTenantRiskMetrics({ tenantId }: { tenantId: number }) {
        const rows = await this.db.query(
            `
        SELECT
            rc.code        AS risk_category_code,
            rc.title       AS risk_category_title,
            rc.description AS risk_category_description,
            rc.weightage   AS risk_category_weightage,

            rm.code        AS risk_metric_code,
            rm.title       AS risk_metric_title,
            rm.description AS risk_metric_description,
            rm.min_value   AS risk_metric_min,
            rm.max_value   AS risk_metric_max,

            COALESCE(tmv.value, 0) AS tenant_metric_value,

            rc.display_order AS risk_category_display_order,
            rm.display_order AS risk_metric_display_order

        FROM risk_category rc
        JOIN risk_metric rm
        ON rc.code = rm.category_code

        LEFT JOIN tenant_metric_value tmv
        ON rm.code = tmv.metric_code
        AND tmv.tenant_id = $1

        ORDER BY
            rc.display_order,
            rm.display_order;

        `,
            [tenantId],
        );

        return rows || null;
    }

    async upsertTenantMetricValues(rows: TenantMetricRow[]) {
        const sql = `
            INSERT INTO tenant_metric_value (tenant_id, metric_code, value)
            VALUES ${rows.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(",")}
            ON CONFLICT (tenant_id, metric_code)
            DO UPDATE SET
            value = EXCLUDED.value
        `;

        const params = rows.flatMap((r) => [r.tenant_id, r.metric_code, r.value]);

        await this.db.query(sql, params);
    }

    async getRiskStructure() {
        return await this.db.query(`
            SELECT
                rc.code      AS category_code,
                rc.title     AS category_title,
                rc.weightage AS category_weightage,

                rm.code      AS metric_code,
                rm.title     AS metric_title
            FROM risk_category rc
            JOIN risk_metric rm 
                ON rm.category_code = rc.code
            ORDER BY rc.display_order, rm.display_order;
        `);
    }

    async getTenantMetricValues(tenantId: number) {
        const rows = await this.db.query(
            `
                SELECT
                    rm.code  AS "metricCode",
                    COALESCE(tmv.value, 0) AS "value"
                FROM risk_metric rm
                LEFT JOIN tenant_metric_value tmv
                    ON tmv.metric_code = rm.code
                AND tmv.tenant_id = $1
                ORDER BY rm.category_code, rm.display_order
             `,
            [tenantId],
        );

        return {
            metricValues: rows,
        };
    }
}
