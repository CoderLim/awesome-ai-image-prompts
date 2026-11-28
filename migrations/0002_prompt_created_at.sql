-- Existing rows have unknown first-insert time; do not use last sync as history.
ALTER TABLE prompts ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS prompts_type_created ON prompts(media_type,created_at DESC,id);
