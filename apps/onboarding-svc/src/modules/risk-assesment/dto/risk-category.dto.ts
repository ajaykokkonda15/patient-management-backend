import { Type } from "class-transformer";
import { IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { RiskMetricDto } from "./risk-metric.dto";

export class RiskCategoryDto {
    @IsString()
    code: string;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsInt()
    @Min(1, { message: "Weight must be at least 1" })
    @Max(100, { message: "Weight cannot exceed 100" })
    weightage: number;

    @IsArray({ message: "Metrics must be an array" })
    @ValidateNested({ each: true })
    @Type(() => RiskMetricDto)
    metrics: RiskMetricDto[];
}
