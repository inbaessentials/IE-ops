-- Table: roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}',
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles if they don't exist
INSERT INTO roles (name, is_custom, permissions)
SELECT 'Admin', false, '{"Dashboard": ["View", "Edit", "Add", "Delete", "Export", "Settings"], "Inventory": ["View", "Edit", "Add", "Delete", "Export", "Settings"], "Sales": ["View", "Edit", "Add", "Delete", "Export", "Settings"], "Purchases": ["View", "Edit", "Add", "Delete", "Export", "Settings"], "Expenses": ["View", "Edit", "Add", "Delete", "Export", "Settings"], "Customers": ["View", "Edit", "Add", "Delete", "Export", "Settings"], "Reports": ["View", "Edit", "Add", "Delete", "Export", "Settings"], "Settings": ["View", "Edit", "Add", "Delete", "Export", "Settings"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Admin');

INSERT INTO roles (name, is_custom, permissions)
SELECT 'Manager', false, '{"Dashboard": ["View", "Edit", "Export"], "Inventory": ["View", "Edit", "Add", "Export"], "Sales": ["View", "Edit", "Add", "Export"], "Purchases": ["View", "Edit", "Add", "Export"], "Expenses": ["View", "Edit", "Add", "Export"], "Customers": ["View", "Edit", "Add", "Export"], "Reports": ["View", "Edit", "Export"], "Settings": ["View"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Manager');

INSERT INTO roles (name, is_custom, permissions)
SELECT 'Staff', false, '{"Dashboard": ["View"], "Inventory": ["View"], "Sales": ["View", "Add"], "Purchases": ["View"], "Expenses": ["View", "Add"], "Customers": ["View", "Add"], "Reports": ["View"], "Settings": ["View"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Staff');

-- Remove existing role constraint on users table if exists
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'users'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%role%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT ' || constraint_name;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;
