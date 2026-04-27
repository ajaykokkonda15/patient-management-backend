import { IsOptional, IsString } from "class-validator";

export class GetReferenceDto {
    @IsOptional()
    @IsString()
    keys?: string;
}
