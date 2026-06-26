-- Add missing enum values to lead_source enum (PG 14+)
ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'instagram';
ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'linkedin';
ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'referral';
ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'ivr_calls';
ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'whatsapp';
ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'email_campaign';
