import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { DashboardDB } from "./dashboard.db";

@Module({
    controllers: [DashboardController],
    providers: [DashboardService, DashboardDB],
})
export class DashboardModule {}
