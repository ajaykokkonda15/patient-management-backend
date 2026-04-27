import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { Controller, Get, HttpCode, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ReqUser } from "../../decorators/auth.decorator";
import type { IAuthJwtPayload } from "@app/common";

@ApiTags("dashboard")
@Controller("dashboard")
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get("")
    @HttpCode(200)
    @ApiOperation({ summary: "Get Dashboard Data" })
    @UseGuards(AuthGuard)
    async getDashboardData(@ReqUser() user: IAuthJwtPayload) {
        return await this.dashboardService.getDashboardData(user);
    }
}
