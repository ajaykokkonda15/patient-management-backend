import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsNotEmpty, Matches, IsEmail } from "class-validator";

export class UpdatePasswordDto {
    @ApiProperty({ example: "user@example.com" })
    @IsNotEmpty({ message: "Please provide your email address" })
    @IsString()
    @IsEmail({}, { message: "Please provide a valid email address" })
    email: string;

    @ApiProperty({ example: "P@ssw0rd", description: "Plain-text password", minLength: 8, pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).+$" })
    @IsNotEmpty({ message: "Please provide your password" })
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, { message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character" })
    password: string;
}
