import { Injectable } from "@nestjs/common";
import { ProgramBuilderDb } from "./program-builder.db";
import { IAuthJwtPayload } from "@app/common";
import { RiskService } from "../risk-assesment/risk.service";
import { ProfileService } from "../profile/profile.service";
import { UpdateProgramDto } from "@app/db/dto/update-program.dto";

@Injectable()
export class ProgramBuilderService {
    constructor(
        private readonly programBuilderDb: ProgramBuilderDb,
        private readonly riskService: RiskService,
        private readonly profileService: ProfileService,
    ) {}

    async getAllPrograms(user: IAuthJwtPayload) {
        return await this.programBuilderDb.getDraftProgramsWithCount(user.tenantId);
    }

    async getProgramInfo(programId: "new" | number, user: IAuthJwtPayload) {
        const [programInfo, tenantProfile, risks] = await Promise.all([
            this.programBuilderDb.getProgramInfo(programId, user.tenantId),
            this.profileService.getTenantProfile(user),
            this.riskService.getTenantRiskMetrics(user),
        ]);

        return {
            ...programInfo,
            ...tenantProfile,
            ...risks,
        };
    }

    async updateProgramInfo(programId: "new" | number, user: IAuthJwtPayload, payload: UpdateProgramDto) {
        return await this.programBuilderDb.updateProgramInfo(programId, user.tenantId, payload, user.userId);
    }
}
