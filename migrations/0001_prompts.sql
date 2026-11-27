CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image','video')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(tags)),
  input_mode TEXT NOT NULL,
  model TEXT,
  media TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(media)),
  author TEXT CHECK (author IS NULL OR json_valid(author)),
  source_url TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0,1)),
  featured_rank INTEGER,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS prompts_type_slug ON prompts(media_type,slug);
CREATE INDEX IF NOT EXISTS prompts_type_category ON prompts(media_type,category);
CREATE INDEX IF NOT EXISTS prompts_type_featured ON prompts(media_type,featured,featured_rank);
