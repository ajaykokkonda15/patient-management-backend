import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class NomiateUserRoleDTO {
    @ApiProperty({ example: "john@example.com" })
    @IsNotEmpty({ message: "Please provide your email address" })
    @IsEmail({}, { message: "Please provide a valid email address" })
    email: string;

    @ApiProperty({ example: "Sarah Mclean", required: true })
    @IsString()
    @MinLength(4, { message: "Full name must be at least 4 characters long" })
    fullName: string;

    @ApiProperty({ example: "ADMIN" })
    @IsString()
    @IsNotEmpty({ message: "Please select a role" })
    roleCode: string;
}
