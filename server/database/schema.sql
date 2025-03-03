-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS passwords (
    id SERIAL PRIMARY KEY,
    password_value VARCHAR(50) NOT NULL,
    length INTEGER NOT NULL,
    has_alphabets BOOLEAN DEFAULT true,
    has_numbers BOOLEAN DEFAULT false,
    has_symbols BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    label VARCHAR(50) DEFAULT 'Unnamed Password'
);

CREATE TABLE IF NOT EXISTS password_history (
    id SERIAL PRIMARY KEY,
    password_id INTEGER,
    action VARCHAR(20),
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password_label VARCHAR(50) DEFAULT 'Unnamed Password' NOT NULL,
    FOREIGN KEY (password_id) REFERENCES passwords(id) ON DELETE SET NULL
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_password_label ON password_history(password_label);

-- Insert some initial data to test the history
INSERT INTO passwords (password_value, length, has_alphabets, has_numbers, has_symbols, label)
VALUES ('TestPassword123!', 14, true, true, true, 'Test Password');

INSERT INTO password_history (password_id, action)
SELECT id, 'CREATE' FROM passwords WHERE label = 'Test Password';
