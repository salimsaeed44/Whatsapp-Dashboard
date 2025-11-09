-- Migration: Create conversations table
-- Description: Creates the conversations table for managing customer conversations
-- Date: 2025-01-17

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending', 'assigned')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    unread_count INTEGER DEFAULT 0 CHECK (unread_count >= 0),
    is_archived BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_phone_number ON conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_priority ON conversations(priority);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status_assigned ON conversations(status, assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_unread_count ON conversations(unread_count DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_conversations_updated_at 
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add conversation_id foreign key to messages table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'messages_conversation_id_fkey'
    ) THEN
        ALTER TABLE messages
        ADD CONSTRAINT messages_conversation_id_fkey 
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL;
    END IF;
END $$;

