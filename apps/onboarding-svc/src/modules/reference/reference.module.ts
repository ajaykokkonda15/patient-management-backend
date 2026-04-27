import { Module } from "@nestjs/common";
import { ReferenceController } from "./reference.controller";
import { ReferenceService } from "./reference.service";
import { ReferenceDb } from "./reference.db";

@Module({
    controllers: [ReferenceController],
    providers: [ReferenceService, ReferenceDb],
})
export class ReferenceModule {}
