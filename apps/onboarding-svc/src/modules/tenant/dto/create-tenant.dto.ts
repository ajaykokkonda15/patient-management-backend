import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class CreateTenantDTO {
    @ApiProperty({ example: "john@example.com" })
    @IsNotEmpty({ message: "Please provide your email address" })
    @IsEmail({}, { message: "Please provide a valid email address" })
    email: string;

    @ApiProperty({ example: "12 345 678 901", required: true })
    @IsNotEmpty({ message: "Please provide the ABN (Australian Business Number)" })
    @IsString()
    @Transform(({ value }) => value.trim().replace(/\s+/g, ""))
    @Length(11, 11, { message: "ABN must be exactly 11 digits" })
    abn: string;

    @ApiProperty({ example: "Harbour Homes Pvt Ltd", required: true })
    @IsString()
    @MinLength(4, { message: "Legal entity name must be at least 4 characters long" })
    legalEntityName: string;
}
