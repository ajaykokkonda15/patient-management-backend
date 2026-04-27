export enum ERoles {
    ADMIN = "Admin",
    COMPLIANCE_OFFICER = "Compliance Officer",
    SENIOR_MANAGER = "Senior Manager",
    STAFF_USER = "Staff User",
    AUDITOR_REVIEWER = "Auditor / Reviewer",
}

export enum ELeagalStructures {
    SOLE_TRADER = "Sole Trader",
    PARTNERSHIP = "Partnership",
    COMPANY = "Company",
    TRUST = "Trust",
}

export enum EIndustrySectors {
    REAL_ESTATE = "Real Estate",
    LEGAL = "Legal",
    ACCOUNTING = "Accounting",
    TRUST_AND_COMPANY_SERVICES = "Trust and Company Services",
}

export enum EDesignatedServices {
    ONE = "Buying/selling real property",
    TWO = "Managing client monies in trust",
    THREE = "Real estate transactions involving offshore buyers",
    FOUR = "Property development advisory",

    FIVE = "Managing client funds in trust",
    SIX = "Company formation",
    SEVEN = "Real property transactions",
    EIGHT = "Estate planning and trusts",
    NINE = "Commercial transactions",

    TEN = "Trust account management",
    ELEVEN = "Tax advisory",
    TWELVE = "Business valuation",
    THIRTEEN = "Audit services",
    FOURTEEN = "Financial planning",

    FIFTEEN = "Company formation services",
    SIXTEEN = "Trust administration",
    SEVENTEEN = "Nominee services",
    EIGHTEEN = "Registered office services",
}

export const CDesignatedServicesMap: Record<EIndustrySectors, EDesignatedServices[]> = {
    [EIndustrySectors.REAL_ESTATE]: [EDesignatedServices.ONE, EDesignatedServices.TWO, EDesignatedServices.THREE, EDesignatedServices.FOUR],

    [EIndustrySectors.LEGAL]: [EDesignatedServices.FIVE, EDesignatedServices.SIX, EDesignatedServices.SEVEN, EDesignatedServices.EIGHT, EDesignatedServices.NINE],

    [EIndustrySectors.ACCOUNTING]: [EDesignatedServices.TEN, EDesignatedServices.ELEVEN, EDesignatedServices.TWELVE, EDesignatedServices.THIRTEEN, EDesignatedServices.FOURTEEN],

    [EIndustrySectors.TRUST_AND_COMPANY_SERVICES]: [EDesignatedServices.FIFTEEN, EDesignatedServices.SIXTEEN, EDesignatedServices.SEVENTEEN, EDesignatedServices.EIGHTEEN],
};

export enum ENumberOfEmployeesBands {
    BAND_1_5 = "1 - 5",
    BAND_6_19 = "6 - 19",
    BAND_20_99 = "20 - 99",
    BAND_100_PLUS = "100+",
}

export enum EAnnualRevenueBands {
    BAND_UNDER_500K = "Less than $500,000",
    BAND_500K_1M = "$500,000 - $1 million",
    BAND_1M_5M = "$1 million - $5 million",
    BAND_5M_20M = "$5 million - $20 million",
    BAND_20M_PLUS = "More than $20 million",
}

export enum ERiskRating {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
}
