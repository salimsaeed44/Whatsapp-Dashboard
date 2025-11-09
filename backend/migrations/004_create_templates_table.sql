-- Migration: Create templates table
-- Description: Creates the templates table for message templates
-- Date: 2025-01-17

CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    language VARCHAR(10) DEFAULT 'ar',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_approval')),
    whatsapp_template_id VARCHAR(255) UNIQUE,
    variables JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_language ON templates(language);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_whatsapp_template_id ON templates(whatsapp_template_id);
CREATE INDEX IF NOT EXISTS idx_templates_status_category ON templates(status, category);

-- Create trigger for updated_at
CREATE TRIGGER update_templates_updated_at 
BEFORE UPDATE ON templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

