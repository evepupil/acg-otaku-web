-- 001_curation_tables.sql
-- 策展模式数据库迁移：新增每日精选、画师专题、话题专题表

-- pic表新增字段
ALTER TABLE pic ADD COLUMN curation_type TEXT;   -- ranking_pick/daily_art/artist_feature/topic_feature
ALTER TABLE pic ADD COLUMN curated_date TEXT;
ALTER TABLE pic ADD COLUMN editor_comment TEXT;

-- 每日精选
CREATE TABLE daily_pick (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pick_date TEXT NOT NULL,
  pick_type TEXT NOT NULL DEFAULT 'daily_art',  -- ranking_pick | daily_art
  title TEXT,
  description TEXT,
  cover_pid TEXT,
  is_published INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE daily_pick_artwork (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  daily_pick_id INTEGER NOT NULL,
  pid TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  editor_comment TEXT
);

-- 画师专题
CREATE TABLE artist_feature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artist_avatar TEXT,
  artist_bio TEXT,
  feature_title TEXT NOT NULL,
  feature_content TEXT,          -- Markdown
  cover_pid TEXT,
  pixiv_url TEXT,
  twitter_url TEXT,
  is_published INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE artist_feature_artwork (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_feature_id INTEGER NOT NULL,
  pid TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  editor_comment TEXT
);

-- 话题专题
CREATE TABLE topic_feature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_name TEXT NOT NULL,
  topic_slug TEXT NOT NULL UNIQUE,
  topic_description TEXT,
  feature_content TEXT,          -- Markdown
  cover_pid TEXT,
  tags TEXT,                     -- 逗号分隔
  is_published INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE topic_feature_artwork (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_feature_id INTEGER NOT NULL,
  pid TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  editor_comment TEXT
);

-- 索引
CREATE INDEX idx_daily_pick_date ON daily_pick(pick_date);
CREATE INDEX idx_daily_pick_published ON daily_pick(is_published);
CREATE INDEX idx_artist_feature_published ON artist_feature(is_published);
CREATE INDEX idx_topic_feature_published ON topic_feature(is_published);
CREATE INDEX idx_topic_feature_slug ON topic_feature(topic_slug);
