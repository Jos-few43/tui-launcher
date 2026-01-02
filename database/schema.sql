-- TUI Launcher Database Schema

-- Main TUI registry
CREATE TABLE IF NOT EXISTS tuis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  command TEXT NOT NULL,
  install_command TEXT,
  executable_path TEXT,
  category TEXT,
  subcategory TEXT,
  source TEXT NOT NULL, -- 'github', 'npm', 'local', 'manual', 'awesome-tuis'
  source_url TEXT,
  homepage_url TEXT,
  repo_url TEXT,
  version TEXT,
  installed_version TEXT,
  is_installed INTEGER DEFAULT 0, -- Boolean: 0 = false, 1 = true
  is_favorite INTEGER DEFAULT 0,  -- Boolean: 0 = false, 1 = true
  ascii_art TEXT,
  screenshot_url TEXT,
  tags TEXT, -- JSON array stored as TEXT
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_launched_at DATETIME,
  launch_count INTEGER DEFAULT 0
);

-- Category definitions
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT
);

-- User favorites (redundant with is_favorite flag, but allows notes)
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tui_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (tui_id) REFERENCES tuis(id) ON DELETE CASCADE
);

-- Launch history tracking
CREATE TABLE IF NOT EXISTS launch_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tui_id INTEGER NOT NULL,
  launched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  exit_code INTEGER,
  duration_ms INTEGER,
  error_message TEXT,
  FOREIGN KEY (tui_id) REFERENCES tuis(id) ON DELETE CASCADE
);

-- TUI source configurations
CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'github', 'npm', 'local', 'awesome-tuis'
  url TEXT,
  enabled INTEGER DEFAULT 1, -- Boolean: 0 = false, 1 = true
  last_synced_at DATETIME,
  config TEXT -- JSON configuration stored as TEXT
);

-- App settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT -- 'string', 'number', 'boolean', 'json'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tuis_slug ON tuis(slug);
CREATE INDEX IF NOT EXISTS idx_tuis_category ON tuis(category);
CREATE INDEX IF NOT EXISTS idx_tuis_source ON tuis(source);
CREATE INDEX IF NOT EXISTS idx_tuis_is_installed ON tuis(is_installed);
CREATE INDEX IF NOT EXISTS idx_tuis_is_favorite ON tuis(is_favorite);
CREATE INDEX IF NOT EXISTS idx_launch_history_tui_id ON launch_history(tui_id);
CREATE INDEX IF NOT EXISTS idx_launch_history_launched_at ON launch_history(launched_at);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, slug, description, icon, color) VALUES
  ('Development', 'development', 'Development tools and utilities', '💻', '#7AA2F7'),
  ('Media', 'media', 'Video, audio, and image processing', '🎬', '#9ECE6A'),
  ('AI Tools', 'ai-tools', 'AI and machine learning tools', '🤖', '#BB9AF7'),
  ('System', 'system', 'System utilities and monitoring', '⚙️', '#E0AF68'),
  ('Productivity', 'productivity', 'Productivity and organization tools', '📋', '#7DCFFF'),
  ('Games', 'games', 'Terminal games and entertainment', '🎮', '#F7768E'),
  ('Network', 'network', 'Networking and communication tools', '🌐', '#73DACA');

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, type) VALUES
  ('theme', 'tokyonight', 'string'),
  ('theme_auto_detect', '1', 'boolean'),
  ('default_tab', 'showcase', 'string'),
  ('show_showcase_on_startup', '1', 'boolean'),
  ('terminal_emulator', 'auto', 'string'),
  ('sync_interval_hours', '24', 'number');
