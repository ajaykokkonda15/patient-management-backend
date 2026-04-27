-- Add default roles to roles table
INSERT INTO
    roles (code, description)
VALUES
    ('ADMIN', 'Admin'),
    ('COMPLIANCE_OFFICER', 'Compliance Officer'),
    ('SENIOR_MANAGER', 'Senior Manager'),
    ('STAFF_USER', 'Staff User'),
    ('AUDITOR_REVIEWER', 'Auditor / Reviewer') ON CONFLICT (code) DO NOTHING;

-- Add default configs to legal_structure, industry_sector, designated_service,
INSERT INTO
    legal_structure (code, description)
VALUES
    ('SOLE_TRADER', 'Sole Trader'),
    ('PARTNERSHIP', 'Partnership'),
    ('COMPANY', 'Company'),
    ('TRUST', 'Trust') ON CONFLICT (code) DO NOTHING;

INSERT INTO
    industry_sector (code, description)
VALUES
    ('REAL_ESTATE', 'Real Estate'),
    ('LEGAL', 'Legal'),
    ('ACCOUNTING', 'Accounting'),
    (
        'TRUST_AND_COMPANY_SERVICES',
        'Trust and Company Services'
    ) ON CONFLICT (code) DO NOTHING;

INSERT INTO
    designated_service (code, description)
VALUES
    ('ONE', 'Buying/selling real property'),
    ('TWO', 'Managing client monies in trust'),
    (
        'THREE',
        'Real estate transactions involving offshore buyers'
    ),
    ('FOUR', 'Property development advisory'),
    ('FIVE', 'Managing client funds in trust'),
    ('SIX', 'Company formation'),
    ('SEVEN', 'Real property transactions'),
    ('EIGHT', 'Estate planning and trusts'),
    ('NINE', 'Commercial transactions'),
    ('TEN', 'Trust account management'),
    ('ELEVEN', 'Tax advisory'),
    ('TWELVE', 'Business valuation'),
    ('THIRTEEN', 'Audit services'),
    ('FOURTEEN', 'Financial planning'),
    ('FIFTEEN', 'Company formation services'),
    ('SIXTEEN', 'Trust administration'),
    ('SEVENTEEN', 'Nominee services'),
    ('EIGHTEEN', 'Registered office services') ON CONFLICT (code) DO NOTHING;

INSERT INTO
    sector_designated_service (sector_code, designated_service_code)
VALUES
    -- REAL ESTATE
    ('REAL_ESTATE', 'ONE'),
    ('REAL_ESTATE', 'TWO'),
    ('REAL_ESTATE', 'THREE'),
    ('REAL_ESTATE', 'FOUR'),
    -- LEGAL
    ('LEGAL', 'FIVE'),
    ('LEGAL', 'SIX'),
    ('LEGAL', 'SEVEN'),
    ('LEGAL', 'EIGHT'),
    ('LEGAL', 'NINE'),
    -- ACCOUNTING
    ('ACCOUNTING', 'TEN'),
    ('ACCOUNTING', 'ELEVEN'),
    ('ACCOUNTING', 'TWELVE'),
    ('ACCOUNTING', 'THIRTEEN'),
    ('ACCOUNTING', 'FOURTEEN'),
    -- TRUST & COMPANY SERVICES
    ('TRUST_AND_COMPANY_SERVICES', 'FIFTEEN'),
    ('TRUST_AND_COMPANY_SERVICES', 'SIXTEEN'),
    ('TRUST_AND_COMPANY_SERVICES', 'SEVENTEEN'),
    ('TRUST_AND_COMPANY_SERVICES', 'EIGHTEEN') ON CONFLICT (sector_code, designated_service_code) DO NOTHING;

-- Add default bands to employee_band and annual_revenue_band tables
INSERT INTO
    employee_band (code, min, max, description)
VALUES
    ('BAND_1_5', 1, 5, '1 - 5'),
    ('BAND_6_19', 6, 19, '6 - 19'),
    ('BAND_20_99', 20, 99, '20 - 99'),
    ('BAND_100_PLUS', 100, NULL, '100+') ON CONFLICT (code) DO NOTHING;

-- Annual Revenue Bands
INSERT INTO
    annual_revenue_band (code, min, max, description)
VALUES
    (
        'BAND_UNDER_500K',
        0.00,
        499999.99,
        'Less than $500,000'
    ),
    (
        'BAND_500K_1M',
        500000.00,
        1000000.00,
        '$500,000 - $1 million'
    ),
    (
        'BAND_1M_5M',
        1000000.01,
        5000000.00,
        '$1 million - $5 million'
    ),
    (
        'BAND_5M_20M',
        5000000.01,
        20000000.00,
        '$5 million - $20 million'
    ),
    (
        'BAND_20M_PLUS',
        20000000.01,
        NULL,
        'More than $20 million'
    ) ON CONFLICT (code) DO NOTHING;

-- Risk Category
INSERT INTO
    risk_category (
        code,
        title,
        description,
        weightage,
        display_order
    )
VALUES
    (
        'CUSTOMER_TYPE_RISK',
        'Customer Risk',
        '1 = Simple individuals, 5 = Complex offshore structures',
        30,
        1
    ),
    (
        'PRODUCT_SERVICE_RISK',
        'Product / Service Risk',
        NULL,
        25,
        2
    ),
    ('DELIVERY_RISK', 'Delivery Risk', NULL, 25, 3),
    ('GEOGRAPHIC_RISK', 'Geographic Risk', NULL, 20, 4) ON CONFLICT (code) DO NOTHING;

-- Risk Metric 
INSERT INTO
    risk_metric (
        code,
        title,
        description,
        category_code,
        min_value,
        max_value,
        display_order
    )
VALUES
    -- =========================
    -- Customer Type Risk
    -- =========================
    (
        'CUSTOMER_COMPLEXITY',
        'Customer Complexity',
        NULL,
        'CUSTOMER_TYPE_RISK',
        0,
        5,
        1
    ),
    (
        'NON_RESIDENT_CUSTOMER_PERCENTAGE',
        'Non-resident Customer Percentage',
        NULL,
        'CUSTOMER_TYPE_RISK',
        0,
        5,
        2
    ),
    -- =========================
    -- Product / Service Risk
    -- =========================
    (
        'CASH_TRANSACTION_INTENSITY',
        'Cash Transaction Intensity',
        NULL,
        'PRODUCT_SERVICE_RISK',
        0,
        5,
        1
    ),
    (
        'TRANSACTION_COMPLEXITY',
        'Transaction Complexity',
        NULL,
        'PRODUCT_SERVICE_RISK',
        0,
        5,
        2
    ),
    -- =========================
    -- Delivery
    -- =========================
    (
        'NON_FACE_TO_FACE_ONBOARDING',
        'Non-Face-to-Face Onboarding',
        NULL,
        'DELIVERY_RISK',
        0,
        5,
        1
    ),
    (
        'RELIANCE_ON_INTERMEDIARIES',
        'Reliance on Intermediaries',
        NULL,
        'DELIVERY_RISK',
        0,
        5,
        2
    ),
    -- =========================
    -- Geographic Risk
    -- =========================
    (
        'HIGH_RISK_JURISDICTION_EXPOSURE',
        'High-Risk Jurisdiction Exposure',
        NULL,
        'GEOGRAPHIC_RISK',
        0,
        5,
        1
    ),
    (
        'CROSS_BORDER_TRANSACTIONS',
        'Cross-Border Transactions',
        NULL,
        'GEOGRAPHIC_RISK',
        0,
        5,
        2
    );

-- Customer types
INSERT INTO customer_type (
    code,
    description
)
VALUES
    ('INDIVIDUALS_OTHER_THAN_SOLE_TRADER', 'Individuals (other than sole trader)'),
    ('SOLE_TRADER', 'Sole trader'),
    ('REGISTERED_COMPANY_DOMESTIC_AND_FOREIGN', 'Registered company (domestic and foreign)'),
    ('UNREGISTERED_FOREIGN_COMPANY', 'Unregistered foreign company'),
    ('PARTNERSHIP', 'Partnership'),
    ('GENERAL_PARTNERSHIP', 'General partnership'),
    ('LIMITED_PARTNERSHIP', 'Limited partnership'),
    ('INCORPORATED_LIMITED_PARTNERSHIP', 'Incorporated limited partnership'),
    ('TRUST', 'Trust'),
    ('INCORPORATED_ASSOCIATION', 'Incorporated association'),
    ('UNINCORPORATED_ASSOCIATION', 'Unincorporated association'),
    ('REGISTERED_CO_OPERATIVE', 'Registered co-operative'),
    ('GOVERNMENT_BODY', 'Government body')
ON CONFLICT (code) DO NOTHING;

INSERT INTO compliance_reporting_frequency (
    code,
    description
)
VALUES
    ('ANNUAL', 'Yearly (Recommended)')
ON CONFLICT (code) DO NOTHING;