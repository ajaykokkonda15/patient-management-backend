import { ERiskRating } from "./common.enums";

export interface IJwtPayload {
    userId: number;
    email: string;
}

export interface IAuthJwtPayload extends IJwtPayload {
    tenantId: number;
    readonly token: string;
}

export interface IRiskScore {
    overallScore: number;
    overallRating: ERiskRating;
    review: string;
    categories: {
        code: string;
        title: string;
        average: number; // 0–5
        rating: ERiskRating; // Low | Medium | High
    }[];
}
