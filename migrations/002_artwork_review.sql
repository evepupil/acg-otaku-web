-- 002_artwork_review.sql
-- 评审池与收藏素材支持

CREATE TABLE IF NOT EXISTS artwork_review (
  pid TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'seen',  -- seen | favorite | rejected
  review_note TEXT,
  first_seen_at TEXT DEFAULT (datetime('now')),
  last_seen_at TEXT DEFAULT (datetime('now')),
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_artwork_review_status ON artwork_review(status);
CREATE INDEX IF NOT EXISTS idx_artwork_review_reviewed_at ON artwork_review(reviewed_at);
