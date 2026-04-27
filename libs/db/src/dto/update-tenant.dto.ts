import { IsString, IsArray, IsInt, Min, IsOptional, Matches } from "class-validator";
import { Transform, Type } from "class-transformer";

export class UpdateTenantDto {
    // ---------------- Core Identity ----------------
    @IsOptional()
    @IsString()
    legal_entity_name?: string;

    // TODO validation pending
    @IsOptional()
    @IsString()
    abn?: string;

    @IsOptional()
    @IsString()
    trading_name?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @Transform(({ value }) => value?.replace(/\D/g, ""))
    @Matches(/^[0-9]{8}$/, {
        message: "Invalid AUSTRAC ID. Must be exactly 8 digits.",
    })
    austrac_id?: string;

    // ---------------- Reference Codes ----------------

    @IsOptional()
    @IsString()
    legal_structure_code?: string;

    @IsOptional()
    @IsString()
    industry_sector_code?: string;

    @IsOptional()
    @IsArray({ message: "Please select at least one designated service" })
    @IsString({ each: true })
    designated_service_codes?: string[];

    @IsOptional()
    @IsString()
    employees_band_code?: string;

    @IsOptional()
    @IsString()
    annual_revenue_band_code?: string;

    // ---------------- Numbers ----------------

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: "Number of offices must be at least 1" })
    no_of_offices?: number;

    @IsOptional()
    @IsArray({ message: "Please select at least one customer type" })
    @IsString({ each: true })
    customer_type_codes?: string[];
}
