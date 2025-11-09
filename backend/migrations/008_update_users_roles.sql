-- Migration: Update users table roles
-- Description: Updates the users table to support new roles (supervisor, employee)
-- Date: 2025-01-17

-- Drop existing check constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new check constraint with all roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'user', 'supervisor', 'employee'));

-- Update existing users with role 'user' to 'employee' if needed (optional)
-- Uncomment the following line if you want to migrate existing 'user' roles to 'employee'
-- UPDATE users SET role = 'employee' WHERE role = 'user';

