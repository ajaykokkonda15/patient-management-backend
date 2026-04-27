import { Module } from "@nestjs/common";
import { ProgramBuilderController } from "./program-builder.controller";
import { ProgramBuilderService } from "./program-builder.service";
import { ProgramBuilderDb } from "./program-builder.db";
import { RiskModule } from "../risk-assesment/risk.module";
import { ProfileModule } from "../profile/profile.module";

@Module({
    imports: [RiskModule, ProfileModule],
    controllers: [ProgramBuilderController],
    providers: [ProgramBuilderService, ProgramBuilderDb],
})
export class ProgramBuilderModule {}
