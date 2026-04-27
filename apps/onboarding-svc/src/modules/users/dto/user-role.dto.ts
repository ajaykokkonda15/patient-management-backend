import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UserRoleDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsOptional()
    userId?: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsOptional()
    tenantId?: number;

    @ApiProperty({ example: "ADMIN" })
    @IsString()
    @IsNotEmpty({ message: "Please select a role" })
    roleCode: string;
}
