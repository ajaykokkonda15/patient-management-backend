--------------------------------------------------
-- User Roles
--------------------------------------------------
CREATE TABLE
    IF NOT EXISTS roles (
        code VARCHAR(100) PRIMARY KEY,        
        description VARCHAR NOT NULL UNIQUE
    );

--------------------------------------------------
-- Configs
--------------------------------------------------
CREATE TABLE
    IF NOT EXISTS legal_structure (
        code VARCHAR(100) PRIMARY KEY,
        description VARCHAR NOT NULL UNIQUE
    );

CREATE TABLE
    IF NOT EXISTS industry_sector (
        code VARCHAR(100) PRIMARY KEY,
        description VARCHAR NOT NULL UNIQUE
    );

CREATE TABLE
    IF NOT EXISTS designated_service (
        code VARCHAR(100) PRIMARY KEY,
        description VARCHAR NOT NULL UNIQUE
    );

CREATE TABLE
    IF NOT EXISTS sector_designated_service (
        id SERIAL PRIMARY KEY,
        sector_code VARCHAR(100) NOT NULL REFERENCES industry_sector (code),
        designated_service_code VARCHAR(100) NOT NULL REFERENCES designated_service (code),
        UNIQUE (sector_code, designated_service_code)
    );

CREATE TABLE
    IF NOT EXISTS employee_band (
        code VARCHAR(100) PRIMARY KEY,
        min INTEGER NOT NULL,
        max INTEGER,
        description VARCHAR(255) NOT NULL UNIQUE
    );

CREATE TABLE
    IF NOT EXISTS annual_revenue_band (
        code VARCHAR(100) PRIMARY KEY,
        min DECIMAL(15, 2) NOT NULL,
        max DECIMAL(15, 2),
        description VARCHAR(255) NOT NULL UNIQUE
    );

CREATE TABLE
    IF NOT EXISTS customer_type (
        code VARCHAR(100) PRIMARY KEY,
        description VARCHAR NOT NULL UNIQUE
    );

CREATE TABLE
    IF NOT EXISTS compliance_reporting_frequency (
        code VARCHAR(100) PRIMARY KEY,
        description VARCHAR NOT NULL UNIQUE
    );

-- // TODO Create actions table with code, description, action_type (CRUD) 
--------------------------------------------------
-- TENANT
--------------------------------------------------
CREATE TABLE
    IF NOT EXISTS tenant (
        id SERIAL PRIMARY KEY,
        legal_entity_name VARCHAR NOT NULL,
        abn VARCHAR NOT NULL,
        trading_name VARCHAR,
        address VARCHAR,

        austrac_id VARCHAR,
        legal_structure_code VARCHAR REFERENCES legal_structure (code),
        industry_sector_code VARCHAR REFERENCES industry_sector (code),
        designated_service_codes VARCHAR[],
        employees_band_code VARCHAR REFERENCES employee_band (code),
        annual_revenue_band_code VARCHAR REFERENCES annual_revenue_band (code),
        customer_type_codes VARCHAR[],

        no_of_offices INTEGER,
        is_active BOOLEAN DEFAULT true,
        is_setup_complete BOOLEAN default (false),
        owner_id VARCHAR,
        created_at TIMESTAMP DEFAULT now (),
        updated_at TIMESTAMP DEFAULT now ()
    );

-------------------------------------------------- 
-- Risk Assesment Config
-------------------------------------------------- 
-- =========================
-- 1. Risk Categories
-- =========================
CREATE TABLE IF NOT EXISTS risk_category (
    code          TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    description   TEXT,
    weightage        INT NOT NULL CHECK (weightage BETWEEN 0 AND 100),
    display_order INT NOT NULL
);

-- =========================
-- 2. Risk Metrics
-- =========================
CREATE TABLE IF NOT EXISTS risk_metric (
    code           TEXT PRIMARY KEY,
    title          TEXT NOT NULL,
    description    TEXT,
    category_code  TEXT NOT NULL REFERENCES risk_category(code),
    min_value      INT DEFAULT 0,
    max_value      INT DEFAULT 5,
    display_order  INT NOT NULL
    -- // TODO JSONB { 1: varchar, "2": }
);

-- =========================
-- 3. Tenant Metric Values
-- =========================
CREATE TABLE IF NOT EXISTS tenant_metric_value (
    tenant_id   INTEGER NOT NULL REFERENCES tenant(id),
    metric_code TEXT NOT NULL REFERENCES risk_metric(code),
    value       INT NOT NULL CHECK (value BETWEEN 0 AND 5),

    PRIMARY KEY (tenant_id, metric_code)
);

--------------------------------------------------
-- USER
--------------------------------------------------
CREATE TABLE
    IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR,
        last_name VARCHAR,
        middle_name VARCHAR,
        email VARCHAR UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now (),
        updated_at TIMESTAMP DEFAULT now ()
    );

CREATE TABLE
    IF NOT EXISTS user_credentials (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        password VARCHAR,
        created_at TIMESTAMP DEFAULT now ()
    );

CREATE TABLE
    IF NOT EXISTS tenant_user (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users (id),
        tenant_id INTEGER REFERENCES tenant (id),
        signup_link varchar,
        is_active BOOLEAN DEFAULT false,
        UNIQUE (user_id, tenant_id)
    );

CREATE TABLE IF NOT EXISTS tenant_user_roles (
    id SERIAL PRIMARY KEY,
    tenant_user_id INTEGER REFERENCES tenant_user (id),
    role_code VARCHAR REFERENCES roles (code),
    UNIQUE (tenant_user_id, role_code)
);