import { Injectable } from "@nestjs/common";
import { ReferenceDb } from "./reference.db";

@Injectable()
export class ReferenceService {
    constructor(private readonly referenceDb: ReferenceDb) {}

    private groupSectorServices(rows: any[]) {
        const grouped: Record<string, any[]> = {};

        for (const row of rows) {
            if (!grouped[row.sector_code]) {
                grouped[row.sector_code] = [];
            }

            grouped[row.sector_code].push({
                service_code: row.service_code,
            });
        }

        return grouped;
    }

    async getAllReference(keys?: string[]) {
        const loaders = {
            roles: () => this.referenceDb.getRoles(),
            legalStructure: () => this.referenceDb.getLegalStructures(),
            industrySector: () => this.referenceDb.getIndustrySectors(),
            designatedService: () => this.referenceDb.getDesignatedServices(),
            sectorDesignatedService: () => this.referenceDb.getSectorDesignatedServices(),
            employeeBand: () => this.referenceDb.getEmployeeBands(),
            annualRevenueBand: () => this.referenceDb.getAnnualRevenueBands(),
            customerType: () => this.referenceDb.getCustomerTypes(),
        };

        const selected = keys?.length ? keys : Object.keys(loaders);

        const jobs = selected
            .filter((k) => loaders[k])
            .map((k) => ({
                key: k,
                promise: loaders[k](),
            }));

        const results = await Promise.all(jobs.map((j) => j.promise));

        const response: any = {};
        jobs.forEach((job, i) => {
            if (job.key === "sectorDesignatedService") {
                response[job.key] = this.groupSectorServices(results[i]);
            } else {
                response[job.key] = results[i];
            }
        });

        return response;
    }

    getDesignatedServicesBySector(sectorCode: string) {
        return this.referenceDb.getDesignatedServicesBySector(sectorCode);
    }
}
