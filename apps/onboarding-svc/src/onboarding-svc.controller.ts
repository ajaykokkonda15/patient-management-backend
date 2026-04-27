import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { OnboardingSvcService } from "./onboarding-svc.service";

@ApiTags("Onboarding Service")
@Controller()
export class OnboardingSvcController {
    constructor(private readonly onboardingService: OnboardingSvcService) {}

    @Get()
    @ApiOperation({ summary: "Onboarding Service Configs" })
    async getAllConfigs(): Promise<Record<string, any>> {
        return await this.onboardingService.getAllConfigs();
    }
}
