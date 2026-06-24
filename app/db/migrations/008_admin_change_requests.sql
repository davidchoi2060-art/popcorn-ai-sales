CREATE TABLE IF NOT EXISTS admin_change_requests (
  request_id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT '등록'
    CHECK (status IN ('등록', '접수', '처리중', '완료', '보류', '폐기')),
  created_by_operator_id BIGINT REFERENCES admin_operators(operator_id) ON DELETE SET NULL,
  created_by_name VARCHAR(100) NOT NULL,
  created_by_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_change_requests_status
ON admin_change_requests (status);

CREATE INDEX IF NOT EXISTS idx_admin_change_requests_created_at
ON admin_change_requests (created_at DESC);
