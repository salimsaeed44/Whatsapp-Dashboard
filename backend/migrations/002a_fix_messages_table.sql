-- Migration: Fix messages table
-- Description: Remove day_name column if it exists (it uses non-immutable function)
-- Date: 2025-01-17

-- Drop day_name column if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'day_name'
    ) THEN
        ALTER TABLE messages DROP COLUMN day_name;
        RAISE NOTICE 'Dropped day_name column from messages table';
    ELSE
        RAISE NOTICE 'day_name column does not exist, skipping';
    END IF;
END $$;

