import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateProgramDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    data?: any;

    @IsOptional()
    @IsString()
    completed_step_code?: string;

    @IsOptional()
    @IsBoolean()
    is_final_step?: boolean;
}
