// TUI Launcher Type Definitions

export interface TUI {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  long_description?: string;
  command: string;
  install_command?: string;
  executable_path?: string;
  category?: string;
  subcategory?: string;
  source: TUISource;
  source_url?: string;
  homepage_url?: string;
  repo_url?: string;
  version?: string;
  installed_version?: string;
  is_installed: boolean;
  is_favorite: boolean;
  ascii_art?: string;
  screenshot_url?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  last_launched_at?: string;
  launch_count: number;
}

export type TUISource = 'github' | 'npm' | 'local' | 'manual' | 'awesome-tuis';

export interface Category {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface Favorite {
  id?: number;
  tui_id: number;
  added_at?: string;
  notes?: string;
}

export interface LaunchHistory {
  id?: number;
  tui_id: number;
  launched_at?: string;
  exit_code?: number;
  duration_ms?: number;
  error_message?: string;
}

export interface Source {
  id?: number;
  name: string;
  type: TUISource;
  url?: string;
  enabled: boolean;
  last_synced_at?: string;
  config?: Record<string, any>;
}

export interface Setting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface LaunchOptions {
  args?: string[];
  terminal?: 'auto' | 'alacritty' | 'kitty' | 'gnome-terminal' | 'xterm' | 'wezterm';
  cwd?: string;
}

export interface SearchFilters {
  category?: string;
  source?: TUISource;
  is_installed?: boolean;
  is_favorite?: boolean;
  tags?: string[];
}

export interface TUIMetadata {
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  category: string;
  tags: string[];
  command: string;
  install_command?: string;
  homepage?: string;
  repo?: string;
  ascii_art?: string;
  version?: string;
  author?: string;
  license?: string;
}
