-- Migration: 002_add_tracking_columns.sql
-- Description: Add courier and tracking columns to the orders table

ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_partner VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_link TEXT;
