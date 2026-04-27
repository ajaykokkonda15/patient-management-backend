import { Controller, Get, Query, Param } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { ReferenceService } from "./reference.service";
import { GetReferenceDto } from "./dto/reference.dto";

@ApiTags("reference")
@Controller("reference")
export class ReferenceController {
    constructor(private readonly referenceService: ReferenceService) {}
    /**
     * GET /reference
     * GET /reference?keys=roles,industrySector
     */
    @Get()
    @ApiOperation({ summary: "Get all reference or specific reference by keys" })
    @ApiQuery({ name: "keys", required: false, description: "Comma separated list of reference keys" })
    async getReference(@Query() query: GetReferenceDto) {
        return await this.referenceService.getAllReference(query.keys?.split(","));
    }

    /**
     * GET /reference/designated-services/LEGAL
     */
    @Get("designated-services/:sectorCode")
    @ApiOperation({ summary: "Get designated services by sector code" })
    async getServicesBySector(@Param("sectorCode") sectorCode: string) {
        return await this.referenceService.getDesignatedServicesBySector(sectorCode);
    }
}
