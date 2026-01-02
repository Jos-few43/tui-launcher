// TUI Launcher - Execute TUI applications in terminal sessions
import { spawn } from 'child_process';
import type { DatabaseService } from '../database/client';
import type { TUI } from '../../types/tui';

interface LaunchOptions {
  args?: string[];
  cwd?: string;
  terminal?: string; // Specific terminal to use (auto-detect if not provided)
  waitForExit?: boolean; // Wait for TUI to exit before returning
}

interface LaunchResult {
  success: boolean;
  exitCode?: number;
  duration?: number; // Duration in milliseconds
  error?: string;
}

export class TUILauncher {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  /**
   * Detect available terminal emulator on the system
   */
  private async detectTerminal(): Promise<string | null> {
    const terminals = [
      'alacritty',
      'kitty',
      'wezterm',
      'gnome-terminal',
      'konsole',
      'xterm',
      'urxvt',
      'terminator',
      'tilix',
    ];

    for (const terminal of terminals) {
      try {
        const proc = Bun.spawn(['which', terminal], {
          stdout: 'pipe',
          stderr: 'pipe',
        });

        const exitCode = await proc.exited;
        if (exitCode === 0) {
          return terminal;
        }
      } catch (error) {
        // Terminal not found, continue
      }
    }

    return null;
  }

  /**
   * Build terminal launch command based on terminal type
   */
  private buildLaunchCommand(
    terminal: string,
    command: string,
    args: string[] = []
  ): string[] {
    const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command;

    switch (terminal) {
      case 'alacritty':
        return ['alacritty', '-e', 'sh', '-c', fullCommand];

      case 'kitty':
        return ['kitty', 'sh', '-c', fullCommand];

      case 'wezterm':
        return ['wezterm', 'start', '--', 'sh', '-c', fullCommand];

      case 'gnome-terminal':
        return ['gnome-terminal', '--', 'sh', '-c', fullCommand];

      case 'konsole':
        return ['konsole', '-e', 'sh', '-c', fullCommand];

      case 'xterm':
        return ['xterm', '-e', 'sh', '-c', fullCommand];

      case 'urxvt':
        return ['urxvt', '-e', 'sh', '-c', fullCommand];

      case 'terminator':
        return ['terminator', '-x', 'sh', '-c', fullCommand];

      case 'tilix':
        return ['tilix', '-e', 'sh', '-c', fullCommand];

      default:
        // Fallback to xterm
        return ['xterm', '-e', 'sh', '-c', fullCommand];
    }
  }

  /**
   * Launch a TUI application
   */
  async launch(tui: TUI, options: LaunchOptions = {}): Promise<LaunchResult> {
    const startTime = Date.now();

    try {
      // Detect terminal if not specified
      const terminal = options.terminal || (await this.detectTerminal());
      if (!terminal) {
        return {
          success: false,
          error: 'No terminal emulator found. Please install alacritty, kitty, or gnome-terminal.',
        };
      }

      // Build launch command
      const launchCommand = this.buildLaunchCommand(
        terminal,
        tui.command,
        options.args || []
      );

      // Spawn the terminal with TUI
      const proc = spawn(launchCommand[0], launchCommand.slice(1), {
        cwd: options.cwd || process.cwd(),
        detached: !options.waitForExit, // Detach if not waiting
        stdio: options.waitForExit ? 'inherit' : 'ignore',
      });

      if (!options.waitForExit) {
        // Detach from parent process so TUI runs independently
        proc.unref();

        // Record launch immediately
        this.recordLaunch(tui.id!, {
          success: true,
          duration: Date.now() - startTime,
        });

        return {
          success: true,
          duration: Date.now() - startTime,
        };
      }

      // Wait for TUI to exit
      return new Promise((resolve) => {
        proc.on('exit', (code) => {
          const duration = Date.now() - startTime;
          const result: LaunchResult = {
            success: code === 0,
            exitCode: code || undefined,
            duration,
          };

          // Record launch in database
          this.recordLaunch(tui.id!, result);

          resolve(result);
        });

        proc.on('error', (error) => {
          const duration = Date.now() - startTime;
          const result: LaunchResult = {
            success: false,
            error: error.message,
            duration,
          };

          // Record failed launch
          this.recordLaunch(tui.id!, result);

          resolve(result);
        });
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
      };
    }
  }

  /**
   * Record launch in database (update launch count and history)
   */
  private recordLaunch(tuiId: number, result: LaunchResult) {
    try {
      // Add to launch history (this also increments launch_count and updates last_launched_at)
      this.db.addLaunchHistory({
        tui_id: tuiId,
        exit_code: result.exitCode,
        duration_ms: result.duration,
        error_message: result.error,
      });
    } catch (error) {
      console.error('Failed to record launch:', error);
    }
  }

  /**
   * Get launch history for a TUI
   */
  getHistory(tuiId: number, limit: number = 10) {
    return this.db.getLaunchHistory(tuiId, limit);
  }

  /**
   * Get most recently launched TUIs
   */
  getRecentlyLaunched(limit: number = 10) {
    return this.db.getRecentlyLaunchedTUIs(limit);
  }
}
