import { Module } from "@nestjs/common";
import { RiskController } from "./risk.controller";
import { RiskService } from "./risk.service";
import { RiskDB } from "./risk.db";

@Module({
    controllers: [RiskController],
    providers: [RiskService, RiskDB],
    exports: [RiskService],
})
export class RiskModule {}
