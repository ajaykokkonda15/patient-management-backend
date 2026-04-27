

--------------------------------------------------  
-- Tenant-Level Audit Log
-- This captures every change at tenant level.
--------------------------------------------------
CREATE TABLE 
    IF NOT EXISTS tenant_audit_log (
        id SERIAL PRIMARY KEY,

        tenant_id INTEGER NOT NULL,        -- tenant.id

        old_value JSONB,                  -- full snapshot BEFORE
        new_value JSONB,                  -- full snapshot AFTER
        changed_fields JSONB,             -- only changed fields
        changed_columns TEXT[],           -- indexed-friendly list

        action VARCHAR NOT NULL,           -- create | update
        action_description VARCHAR NOT NULL,

        performed_by INTEGER REFERENCES users (id),
        performed_at TIMESTAMP DEFAULT now()
    );

--------------------------------------------------
-- Program-Level Audit Log
-- This captures every change at program level.
--------------------------------------------------
CREATE TABLE IF NOT EXISTS
    program_audit_log (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL REFERENCES tenant (id),
        program_id INTEGER NOT NULL REFERENCES program (id),

        old_value JSONB,                  -- full snapshot BEFORE
        new_value JSONB,                  -- full snapshot AFTER
        changed_fields JSONB,             -- only changed fields
        changed_columns TEXT[],           -- indexed-friendly list

        action VARCHAR NOT NULL, -- create | update | submit | attest
        action_description VARCHAR NOT NULL,
        performed_by INTEGER REFERENCES users (id),
        performed_at TIMESTAMP DEFAULT now ()
    );