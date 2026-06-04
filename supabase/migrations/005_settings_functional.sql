-- Table: settings_organization
CREATE TABLE IF NOT EXISTS settings_organization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255),
    owner_name VARCHAR(255),
    mobile_number VARCHAR(50),
    whatsapp_number VARCHAR(50),
    email_address VARCHAR(255),
    gst_number VARCHAR(50),
    business_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: platform_users (since 'users' might conflict with auth.users or existing tables, using platform_users. But requirement said 'users'. I will create it as 'platform_users' and 'users' view or just 'platform_users')
-- Let's stick to the requirement: "users"
-- If they meant auth.users, they would have specified. I will create 'platform_users' and maybe a view, or just 'app_users' to be safe. Actually, the requirement explicitly says "Database Table: users". Let's assume they don't have public.users yet.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID, -- Link to auth.users if needed
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) CHECK (role IN ('Admin', 'Manager', 'Staff')),
    status VARCHAR(50) DEFAULT 'Active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: settings_alerts
CREATE TABLE IF NOT EXISTS settings_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_alerts_enabled BOOLEAN DEFAULT false,
    low_stock_alert BOOLEAN DEFAULT true,
    out_of_stock_alert BOOLEAN DEFAULT true,
    overstock_alert BOOLEAN DEFAULT false,
    stock_threshold INTEGER DEFAULT 5,
    purchase_reminders_enabled BOOLEAN DEFAULT false,
    vendor_payment_reminder BOOLEAN DEFAULT true,
    purchase_follow_up BOOLEAN DEFAULT true,
    reminder_days_before INTEGER DEFAULT 1,
    daily_summary_enabled BOOLEAN DEFAULT false,
    summary_time TIME DEFAULT '18:00',
    whatsapp_alerts_enabled BOOLEAN DEFAULT false,
    whatsapp_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_name VARCHAR(100),
    active_since DATE,
    renewal_date DATE,
    billing_cycle VARCHAR(50),
    users_allowed INTEGER,
    products_allowed INTEGER,
    storage_limit_mb INTEGER,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: billing_history
CREATE TABLE IF NOT EXISTS billing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_number VARCHAR(100),
    invoice_date DATE,
    amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Paid',
    download_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_type VARCHAR(50),
    last_4 VARCHAR(4),
    expiry VARCHAR(10),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: support_tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    priority VARCHAR(50) CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: knowledge_base_feedback
CREATE TABLE IF NOT EXISTS knowledge_base_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT,
    answer TEXT,
    is_helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: knowledge_base_history
CREATE TABLE IF NOT EXISTS knowledge_base_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT,
    asked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a single initial row for settings if they don't exist
INSERT INTO settings_organization (business_name, owner_name)
SELECT 'Inba Essentials', 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM settings_organization);

INSERT INTO settings_alerts (inventory_alerts_enabled)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM settings_alerts);

INSERT INTO subscriptions (plan_name, users_allowed, products_allowed, storage_limit_mb)
SELECT 'Starter', 3, 1000, 5120
WHERE NOT EXISTS (SELECT 1 FROM subscriptions);
