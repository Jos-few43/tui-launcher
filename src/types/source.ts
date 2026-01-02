// TUI Source Plugin Types

import { TUI, TUISource } from './tui';

export interface TUISourcePlugin {
  name: string;
  type: TUISource;

  /**
   * Fetch TUIs from this source
   */
  sync(): Promise<TUI[]>;

  /**
   * Install a TUI from this source
   */
  install?(tui: TUI): Promise<void>;

  /**
   * Uninstall a TUI
   */
  uninstall?(tui: TUI): Promise<void>;

  /**
   * Check if source is available/accessible
   */
  isAvailable(): Promise<boolean>;
}

export interface GitHubSearchOptions {
  query?: string;
  topics?: string[];
  language?: string;
  perPage?: number;
  page?: number;
}

export interface NpmSearchOptions {
  query?: string;
  keywords?: string[];
  perPage?: number;
  page?: number;
}
