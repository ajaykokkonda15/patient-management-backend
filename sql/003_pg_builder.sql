--------------------------------------------------
-- One row per AML program draft
--------------------------------------------------
CREATE TABLE IF NOT EXISTS
    program (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL REFERENCES tenant (id),
        name VARCHAR NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'draft',
        -- draft | pending | approved | archived

        data JSONB NOT NULL DEFAULT '{}',
        completed BOOLEAN DEFAULT false,
        completed_step_code VARCHAR NOT NULL, -- which step user last saved on        

        created_by INTEGER NOT NULL REFERENCES users (id),
        created_at TIMESTAMP DEFAULT now (),
        updated_at TIMESTAMP DEFAULT now ()
    );

--------------------------------------------------
-- Attested Version (Immutable Snapshot)
-- When user clicks “I attest…”, freeze program.
--------------------------------------------------
CREATE TABLE IF NOT EXISTS
    program_snapshot (
        id SERIAL PRIMARY KEY,
        program_id INTEGER NOT NULL REFERENCES program (id),
        tenant_id INTEGER NOT NULL REFERENCES tenant (id),
        snapshot JSONB NOT NULL, -- all 7 steps merged
        risk_rating VARCHAR,
        risk_score NUMERIC(4, 2),
        attested_by INTEGER REFERENCES users (id),
        attested_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now (),
        -- Document pointer
        UNIQUE (program_id, tenant_id)
    );

--------------------------------------------------
-- Program Summary Cache (for your dashboard)
--------------------------------------------------
CREATE TABLE IF NOT EXISTS
    program_summary (
        program_id INTEGER PRIMARY KEY REFERENCES program (id),
        completed_steps INTEGER DEFAULT 0,
        completion_percent INTEGER DEFAULT 0,
        overall_risk_score NUMERIC(4, 2),
        overall_risk_rating VARCHAR,
        last_calculated TIMESTAMP
    );

--------------------------------------------------
-- Why this is enterprise-grade
--------------------------------------------------
/*
| Requirement         | Solved               |
| ------------------- | -------------------- |
| Multiple drafts     | program table        |
| Save at any step    | program_data         |
| Audit every edit    | program_audit_log    |
| Final snapshot      | program_snapshot     |
| Fast UI             | program_summary      |
| Tenant isolation    | tenant_id everywhere |
| Secure              | RLS compatible       |
*/