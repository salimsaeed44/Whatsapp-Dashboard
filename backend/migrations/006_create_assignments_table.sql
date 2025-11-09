-- Migration: Create assignments table
-- Description: Creates the assignments table for tracking conversation assignments
-- Date: 2025-01-17

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assignment_type VARCHAR(20) DEFAULT 'manual' CHECK (assignment_type IN ('manual', 'auto', 'round_robin', 'load_balance')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'closed', 'reassigned')),
    transferred_from UUID REFERENCES users(id) ON DELETE SET NULL,
    transferred_to UUID REFERENCES users(id) ON DELETE SET NULL,
    transferred_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assignments_conversation_id ON assignments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_to ON assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_by ON assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_assignment_type ON assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_assignments_status_assigned_to ON assignments(status, assigned_to);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON assignments(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_assignments_updated_at 
BEFORE UPDATE ON assignments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

