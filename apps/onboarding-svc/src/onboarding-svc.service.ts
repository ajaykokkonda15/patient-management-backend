import { Injectable } from '@nestjs/common';
import { OnBoardingDB } from './onboarding-svc.db';

@Injectable()
export class OnboardingSvcService {
    constructor(private readonly onboardingDB: OnBoardingDB) {}

    async getAllConfigs(): Promise<Record<string, any>> {
        // Placeholder implementation - replace with actual config retrieval logic
        return {
            appName: 'Onboarding Service',
            version: '1.0.0',
        };
    }
}
