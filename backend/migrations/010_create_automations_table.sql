-- Migration: Create automations table
-- Description: Stores automation rules for automatic actions

CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL, -- 'message_received', 'keyword', 'time_based', etc.
    trigger_conditions JSONB DEFAULT '{}', -- Conditions for triggering
    actions JSONB NOT NULL DEFAULT '[]', -- Actions to perform
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher priority runs first
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create index on trigger_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_automations_trigger_type ON automations(trigger_type) WHERE deleted_at IS NULL AND is_active = true;

-- Create index on priority for sorting
CREATE INDEX IF NOT EXISTS idx_automations_priority ON automations(priority DESC) WHERE deleted_at IS NULL AND is_active = true;

COMMENT ON TABLE automations IS 'Stores automation rules for automatic actions';
COMMENT ON COLUMN automations.trigger_type IS 'Type of trigger (message_received, keyword, time_based, etc.)';
COMMENT ON COLUMN automations.trigger_conditions IS 'Conditions for triggering the automation (JSON object)';
COMMENT ON COLUMN automations.actions IS 'Actions to perform when triggered (JSON array)';

