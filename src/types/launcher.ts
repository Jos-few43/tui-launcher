// TUI Launcher Types

export interface LaunchConfig {
  command: string;
  args?: string[];
  cwd?: string;
  terminal: TerminalEmulator;
  env?: Record<string, string>;
}

export type TerminalEmulator =
  | 'auto'
  | 'alacritty'
  | 'kitty'
  | 'wezterm'
  | 'gnome-terminal'
  | 'konsole'
  | 'xterm'
  | 'urxvt';

export interface LaunchResult {
  success: boolean;
  exit_code?: number;
  duration_ms?: number;
  error?: string;
}

export interface ProcessInfo {
  pid: number;
  command: string;
  started_at: Date;
}
