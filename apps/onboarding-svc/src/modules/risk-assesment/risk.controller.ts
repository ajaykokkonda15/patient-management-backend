import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { RiskService } from "./risk.service";
import { AuthGuard } from "../../guards/auth.guard";
import { ReqUser } from "../../decorators/auth.decorator";
import type { IAuthJwtPayload } from "@app/common";
import { RiskMetricValuesDto } from "./dto/risk-metrics-values.dto";

@ApiTags("risk")
@Controller("risk")
export class RiskController {
    constructor(private readonly riskService: RiskService) {}

    // /risk path will be for updated risk parameters weightage etc

    @Get("/tenant")
    @HttpCode(200)
    @ApiOperation({ summary: "Get Tenant Risk Metrics" })
    @UseGuards(AuthGuard)
    async getTenantRiskMetrics(@ReqUser() user: IAuthJwtPayload) {
        return await this.riskService.getTenantRiskMetrics(user);
    }

    @Get("/tenant/score")
    @HttpCode(200)
    @ApiOperation({ summary: "Get Tenant Risk Score" })
    @UseGuards(AuthGuard)
    async getTenantRiskScore(@ReqUser() user: IAuthJwtPayload) {
        return await this.riskService.getTenantRiskScore(user);
    }

    @Post("/tenant/score")
    @HttpCode(200)
    @ApiOperation({ summary: "Calculate Tenant Risk Score" })
    @UseGuards(AuthGuard)
    async calcTenantRiskScore(@ReqUser() user: IAuthJwtPayload, @Body() dto: RiskMetricValuesDto) {
        return await this.riskService.calcTenantRiskScore(user, dto);
    }

    @Post("/tenant")
    @HttpCode(200)
    @ApiOperation({ summary: "Update Tenant Risk Metrics" })
    @UseGuards(AuthGuard)
    async updateTenantRiskMetrics(@ReqUser() user: IAuthJwtPayload, @Body() dto: RiskMetricValuesDto) {
        return await this.riskService.updateTenantRiskMetrics(user, dto);
    }
}
