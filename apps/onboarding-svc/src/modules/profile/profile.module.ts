import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { ProfileDB } from "./profile.db";

@Module({
    controllers: [ProfileController],
    providers: [ProfileService, ProfileDB],
    exports: [ProfileService],
})
export class ProfileModule {}
