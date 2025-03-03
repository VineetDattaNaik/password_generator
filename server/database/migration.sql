-- Verify and update the password_history table structure
ALTER TABLE password_history MODIFY COLUMN password_label VARCHAR(50) DEFAULT 'Unnamed Password';

-- Add NOT NULL constraint to ensure we always have a label
ALTER TABLE password_history MODIFY COLUMN password_label VARCHAR(50) NOT NULL DEFAULT 'Unnamed Password';

-- Update any existing NULL values
UPDATE password_history 
SET password_label = 'Unnamed Password' 
WHERE password_label IS NULL OR password_label = '';

-- Verify the passwords table structure
ALTER TABLE passwords MODIFY COLUMN label VARCHAR(50) DEFAULT 'Unnamed Password';

-- Add index for better querying
ALTER TABLE password_history ADD INDEX idx_password_label (password_label);
