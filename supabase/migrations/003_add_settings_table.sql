-- Migration: 003_add_settings_table.sql
-- Description: Create settings table for persisting brand logo and company info

CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  company_name VARCHAR(255) DEFAULT 'Inba Essentials',
  gst_in VARCHAR(100) DEFAULT '33ABCDE1234F1Z5',
  return_address TEXT DEFAULT 'Inba Essentials Pvt Ltd.\nOpp. to Annamar Petrol Bunk, Housing Unit,\nMoolapalayam, Erode, Tamil Nadu 638002',
  logo_url TEXT,
  paper_format VARCHAR(50) DEFAULT 'Standard A4',
  include_logo BOOLEAN DEFAULT true,
  include_address BOOLEAN DEFAULT true,
  print_prices BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default row if not exists
INSERT INTO settings (id) VALUES ('default') ON CONFLICT DO NOTHING;
