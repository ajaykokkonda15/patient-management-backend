import { Injectable } from "@nestjs/common";
import { DashboardDB } from "./dashboard.db";
import { IAuthJwtPayload } from "@app/common";

@Injectable()
export class DashboardService {
    constructor (private readonly dashboardDb: DashboardDB) {}

    async getDashboardData(user: IAuthJwtPayload) {
        return await this.dashboardDb.getDashboardData(user); 
    }
}