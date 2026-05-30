-- Migration: 004_add_business_platform_to_settings.sql
-- Description: Expand settings table to support active business platform context selection

ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS business_platform VARCHAR(50) DEFAULT 'inba';
