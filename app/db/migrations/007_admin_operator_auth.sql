ALTER TABLE admin_operators
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS invite_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_admin_operator_invite_token
ON admin_operators (invite_token_hash)
WHERE invite_token_hash IS NOT NULL;
