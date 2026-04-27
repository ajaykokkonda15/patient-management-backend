import { Controller, Get, Param, Patch, Body, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import type { IAuthJwtPayload } from "@app/common";
import { AuthGuard } from "../../guards/auth.guard";
import { ReqUser } from "../../decorators/auth.decorator";
import { ProgramBuilderService } from "./program-builder.service";
import { UpdateProgramDto } from "@app/db/dto/update-program.dto";

@ApiTags("program-builder")
@Controller("program-builder")
export class ProgramBuilderController {
    constructor(private readonly programBuilderService: ProgramBuilderService) {}

    @Get("/")
    @ApiOperation({ summary: "Get all programs" })
    @UseGuards(AuthGuard)
    async getAllPrograms(@ReqUser() user: IAuthJwtPayload) {
        return await this.programBuilderService.getAllPrograms(user);
    }

    /**
     * GET /program-builder/:programId
     */
    @Get(":programId")
    @ApiOperation({ summary: "Get program info by Program ID" })
    @UseGuards(AuthGuard)
    async getProgramInfo(@Param("programId") programId: string, @ReqUser() user: IAuthJwtPayload) {
        return await this.programBuilderService.getProgramInfo(programId === "new" ? "new" : Number(programId), user);
    }

    @Patch(":programId")
    @ApiOperation({ summary: "Update program info by Program ID" })
    @UseGuards(AuthGuard)
    async updateProgramInfo(@Param("programId") programId: string, @ReqUser() user: IAuthJwtPayload, @Body() payload: UpdateProgramDto) {
        return await this.programBuilderService.updateProgramInfo(programId === "new" ? "new" : Number(programId), user, payload);
    }
}
