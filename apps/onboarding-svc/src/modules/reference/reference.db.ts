import { DbService } from "@app/db";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ReferenceDb {
    constructor(private readonly db: DbService) {}

    getRoles() {
        return this.db.query(`
      SELECT code, description
      FROM roles
      ORDER BY description
    `);
    }

    getLegalStructures() {
        return this.db.query(`
      SELECT code, description
      FROM legal_structure
      ORDER BY description
    `);
    }

    getIndustrySectors() {
        return this.db.query(`
      SELECT code, description
      FROM industry_sector
      ORDER BY description
    `);
    }

    getDesignatedServices() {
        return this.db.query(`
      SELECT code, description
      FROM designated_service
      ORDER BY description
    `);
    }

    getSectorDesignatedServices() {
        return this.db.query(`
      SELECT 
        s.code AS sector_code,
        s.description AS sector,
        d.code AS service_code,
        d.description AS service
      FROM sector_designated_service sds
      JOIN industry_sector s ON s.code = sds.sector_code
      JOIN designated_service d ON d.code = sds.designated_service_code
      ORDER BY s.code, d.code
    `);
    }

    getEmployeeBands() {
        return this.db.query(`
      SELECT code, min, max, description
      FROM employee_band
      ORDER BY min
    `);
    }

    getAnnualRevenueBands() {
        return this.db.query(`
      SELECT code, min, max, description
      FROM annual_revenue_band
      ORDER BY min
    `);
    }

    getDesignatedServicesBySector(sectorCode: string) {
        return this.db.query(
            `
            SELECT 
              d.code,
              d.description
            FROM sector_designated_service sds
            JOIN designated_service d 
              ON d.code = sds.designated_service_code
            WHERE sds.sector_code = $1
            ORDER BY d.description
          `,
            [sectorCode],
        );
    }

    getCustomerTypes() {
        return this.db.query(`
      SELECT code, description
      FROM customer_type
      ORDER BY code
    `);
    }
}
