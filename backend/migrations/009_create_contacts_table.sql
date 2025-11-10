-- Migration: Create contacts table
-- Description: Stores contact information for WhatsApp messaging

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    custom_fields JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(phone_number)
);

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_phone_number ON contacts(phone_number) WHERE deleted_at IS NULL;

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_contacts_is_active ON contacts(is_active) WHERE deleted_at IS NULL;

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE contacts IS 'Stores contact information for WhatsApp messaging';
COMMENT ON COLUMN contacts.phone_number IS 'Contact phone number (with country code)';
COMMENT ON COLUMN contacts.name IS 'Contact name';
COMMENT ON COLUMN contacts.email IS 'Contact email (optional)';
COMMENT ON COLUMN contacts.custom_fields IS 'Custom fields for contact (JSON object)';
COMMENT ON COLUMN contacts.metadata IS 'Additional metadata (JSON object)';

