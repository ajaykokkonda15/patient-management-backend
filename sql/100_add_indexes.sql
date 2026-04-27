--------------------------------------------------
-- INDEXES (for enterprise-grade performance)
--------------------------------------------------

-- CREATE INDEX IF NOT EXISTS idx_tenants_legal_structure ON tenants(legal_structure_id);
-- CREATE INDEX IF NOT EXISTS idx_tenants_sector ON tenants(sector_id);
-- CREATE INDEX IF NOT EXISTS idx_tenants_designated_service ON tenants(designated_service_id);

-- CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- CREATE INDEX IF NOT EXISTS idx_payments_tenant ON tenant_payments(tenant_id);
-- CREATE INDEX IF NOT EXISTS idx_trail_tenant ON tenant_trail(tenant_id);

-- CREATE INDEX idx_audit_changed_columns ON tenant_audit_log USING GIN(changed_columns);
-- CREATE INDEX idx_audit_performed_at ON tenant_audit_log(performed_at);
