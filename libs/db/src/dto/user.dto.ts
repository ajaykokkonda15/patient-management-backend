import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional, Length } from "class-validator";

export class UserDto {
    @ApiPropertyOptional({ example: "John" })
    @IsOptional()
    @IsString()
    @Length(1, 255, { message: "First name must be between 1 and 255 characters long" })
    firstName?: string;

    @ApiPropertyOptional({ example: "M.", required: false })
    @IsOptional()
    @IsString()
    @Length(1, 255, { message: "Middle name must be between 1 and 255 characters long" })
    middleName?: string;

    @ApiPropertyOptional({ example: "Doe" })
    @IsOptional()
    @IsString()
    @Length(1, 255, { message: "Last name must be between 1 and 255 characters long" })
    lastName?: string;

    @ApiProperty({ example: "john@example.com" })
    @IsEmail({}, { message: "Please provide a valid email address" })
    @Length(1, 255, { message: "Email must be between 1 and 255 characters long" })
    email: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    isActive?: boolean = true;
}
