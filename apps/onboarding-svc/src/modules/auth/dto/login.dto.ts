import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString, Length } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: "john@example.com" })
    @IsEmail({}, { message: "Please provide a valid email address" })
    email: string;

    @ApiProperty({ example: "P@ssw0rd" })
    @IsString()
    @Length(8, 255, { message: "Password must be between 8 and 255 characters long" })
    password: string;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean({ message: "Remember me must be a boolean value (true or false)" })
    rememberMe?: boolean;
}
