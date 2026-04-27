import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class RiskMetricDto {
    @IsString()
    code: string;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsInt()
    @Min(0, { message: "Minimum value must be at least 0" })
    min: number;

    @IsInt()
    @Min(1, { message: "Maximum value must be at least 1" })
    max: number;

    @IsInt()
    @Min(0, { message: "Value must be at least 0" })
    @Max(5, { message: "Value cannot exceed 5" })
    value: number;
}
