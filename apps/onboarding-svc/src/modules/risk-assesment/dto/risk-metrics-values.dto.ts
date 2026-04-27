import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from "class-validator";

class MetricValue {
    @IsString()
    @IsNotEmpty({ message: "Please select a metric" })
    metricCode: string;

    @IsNumber()
    @Min(0, { message: "Value must be at least 0" })
    value: number;
}

export class RiskMetricValuesDto {
    @IsArray({ message: "Metric values must be an array" })
    @ValidateNested({ each: true })
    @Type(() => MetricValue)
    metricValues: MetricValue[];
}
