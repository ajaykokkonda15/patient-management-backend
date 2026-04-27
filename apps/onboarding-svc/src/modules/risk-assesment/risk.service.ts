import { Injectable } from "@nestjs/common";
import { ERiskRating, IAuthJwtPayload, IRiskScore } from "@app/common";
import { RiskDB } from "./risk.db";
import { RiskMetricValuesDto } from "./dto/risk-metrics-values.dto";
import { RiskCategoryDto } from "./dto/risk-category.dto";

type DbRow = {
    risk_category_code: string;
    risk_category_title: string;
    risk_category_description: string | null;
    risk_category_weightage: number;

    risk_metric_code: string;
    risk_metric_title: string;
    risk_metric_description: string | null;
    risk_metric_min: number;
    risk_metric_max: number;

    tenant_metric_value: number;
};

@Injectable()
export class RiskService {
    constructor(private readonly riskDB: RiskDB) {}

    async getTenantRiskMetrics(user: IAuthJwtPayload) {
        const rows = await this.riskDB.getTenantRiskMetrics({
            tenantId: user.tenantId,
        });

        if (!rows || rows.length === 0) {
            return {
                metrics: [],
                score: {
                    overallScore: 0,
                    overallRating: ERiskRating.LOW,
                    review: "Every 18 months",
                },
            };
        }

        const categoryMap = new Map<string, RiskCategoryDto>();

        // For scoring
        const metricValues: { metricCode: string; value: number }[] = [];

        for (const row of rows as DbRow[]) {
            // build payload for scoring
            metricValues.push({
                metricCode: row.risk_metric_code,
                value: row.tenant_metric_value,
            });

            // build category response
            if (!categoryMap.has(row.risk_category_code)) {
                categoryMap.set(row.risk_category_code, {
                    code: row.risk_category_code,
                    title: row.risk_category_title,
                    description: row.risk_category_description,
                    weightage: row.risk_category_weightage,
                    metrics: [],
                });
            }

            const category = categoryMap.get(row.risk_category_code)!;

            category.metrics.push({
                code: row.risk_metric_code,
                title: row.risk_metric_title,
                description: row.risk_metric_description,
                min: row.risk_metric_min,
                max: row.risk_metric_max,
                value: row.tenant_metric_value,
            });
        }

        // 2️⃣ Compute risk score
        const score = await this.calcTenantRiskScore(user, {
            metricValues,
        });

        return {
            metrics: Array.from(categoryMap.values()),
            score,
        };
    }

    async getTenantRiskScore(user: IAuthJwtPayload): Promise<IRiskScore> {
        const metricValues = await this.riskDB.getTenantMetricValues(user.tenantId);

        return this.calcTenantRiskScore(user, metricValues);
    }

    async calcTenantRiskScore(user: IAuthJwtPayload, payload: RiskMetricValuesDto): Promise<IRiskScore> {
        // 1️ Convert payload → lookup map
        const metricValueMap = new Map<string, number>();
        for (const m of payload.metricValues) {
            metricValueMap.set(m.metricCode, m.value);
        }

        // 2️ Load category + metric structure
        const rows = await this.riskDB.getRiskStructure();
        /*
            rows = [
            {
                category_code,
                category_title,
                category_weightage,
                metric_code
            }
            ]
        */

        // 3️ Group metrics by category
        const categoryMap = new Map<
            string,
            {
                title: string;
                weightage: number;
                values: number[];
            }
        >();

        for (const row of rows) {
            const metricValue = metricValueMap.get(row.metric_code);
            if (metricValue === undefined) continue;

            if (!categoryMap.has(row.category_code)) {
                categoryMap.set(row.category_code, {
                    title: row.category_title,
                    weightage: row.category_weightage,
                    values: [],
                });
            }

            categoryMap.get(row.category_code)!.values.push(metricValue);
        }

        // 4️ Calculate overall + category scores
        let overallScore = 0;
        const categories: any[] = [];

        for (const [categoryCode, data] of categoryMap.entries()) {
            if (!data.values.length) continue;

            const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;

            const weightedScore = avg * (data.weightage / 100);
            overallScore += weightedScore;

            // category rating
            let rating: ERiskRating;
            if (avg <= 2.0) rating = ERiskRating.LOW;
            else if (avg <= 3.5) rating = ERiskRating.MEDIUM;
            else rating = ERiskRating.HIGH;

            categories.push({
                code: categoryCode,
                title: data.title,
                average: Number(avg.toFixed(2)),
                rating,
                weightage: data.weightage,
            });
        }

        overallScore = Number(overallScore.toFixed(2));

        // 5️ Determine overall rating + review
        let overallRating: ERiskRating;
        let review: string;

        if (overallScore <= 2.0) {
            overallRating = ERiskRating.LOW;
            review = "Every 18 months";
        } else if (overallScore >= 2.1 && overallScore <= 3.5) {
            overallRating = ERiskRating.MEDIUM;
            review = "Every 12 months";
        } else {
            overallRating = ERiskRating.HIGH;
            review = "Every 6 months";
        }

        return {
            overallScore,
            overallRating,
            review,
            categories,
        };
    }

    async updateTenantRiskMetrics(user: IAuthJwtPayload, payload: RiskMetricValuesDto) {
        const tenantId = user.tenantId;

        const rows = payload.metricValues.map((m) => ({
            tenant_id: tenantId,
            metric_code: m.metricCode,
            value: m.value,
        }));

        if (!rows.length) return;

        await this.riskDB.upsertTenantMetricValues(rows);

        return {
            success: true,
            message: "Risk metrics updated successfully",
        };
    }
}
