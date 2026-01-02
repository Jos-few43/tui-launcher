// Database Service using Bun's built-in SQLite
import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { TUI, Category, Favorite, LaunchHistory, Source, Setting } from '../../types/tui';

export class DatabaseService {
  private db: Database;
  private dbPath: string;

  constructor(dbPath: string = join(process.env.HOME || '', '.config', 'tui-launcher', 'launcher.db')) {
    this.dbPath = dbPath;
    this.db = new Database(dbPath, { create: true });
    this.initialize();
  }

  private initialize() {
    // Enable WAL mode for better concurrent access
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA foreign_keys = ON');

    // Load and execute schema
    const schemaPath = join(import.meta.dir, '../../../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema (split by semicolon and run each statement)
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    for (const statement of statements) {
      this.db.run(statement);
    }
  }

  // TUI CRUD operations
  addTUI(tui: Omit<TUI, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO tuis (
        name, slug, description, long_description, command, install_command,
        executable_path, category, subcategory, source, source_url, homepage_url,
        repo_url, version, installed_version, is_installed, is_favorite,
        ascii_art, screenshot_url, tags, launch_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      tui.name,
      tui.slug,
      tui.description || null,
      tui.long_description || null,
      tui.command,
      tui.install_command || null,
      tui.executable_path || null,
      tui.category || null,
      tui.subcategory || null,
      tui.source,
      tui.source_url || null,
      tui.homepage_url || null,
      tui.repo_url || null,
      tui.version || null,
      tui.installed_version || null,
      tui.is_installed ? 1 : 0,
      tui.is_favorite ? 1 : 0,
      tui.ascii_art || null,
      tui.screenshot_url || null,
      tui.tags ? JSON.stringify(tui.tags) : null,
      tui.launch_count || 0
    );

    return result.lastInsertRowid as number;
  }

  getTUI(id: number): TUI | null {
    const stmt = this.db.prepare('SELECT * FROM tuis WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.rowToTUI(row) : null;
  }

  getTUIBySlug(slug: string): TUI | null {
    const stmt = this.db.prepare('SELECT * FROM tuis WHERE slug = ?');
    const row = stmt.get(slug) as any;
    return row ? this.rowToTUI(row) : null;
  }

  getAllTUIs(filters?: { is_installed?: boolean; is_favorite?: boolean; category?: string }): TUI[] {
    let query = 'SELECT * FROM tuis WHERE 1=1';
    const params: any[] = [];

    if (filters?.is_installed !== undefined) {
      query += ' AND is_installed = ?';
      params.push(filters.is_installed ? 1 : 0);
    }

    if (filters?.is_favorite !== undefined) {
      query += ' AND is_favorite = ?';
      params.push(filters.is_favorite ? 1 : 0);
    }

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    query += ' ORDER BY name ASC';

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.rowToTUI(row));
  }

  updateTUI(id: number, updates: Partial<TUI>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id' || key === 'created_at') return;

      fields.push(`${key} = ?`);

      if (key === 'tags' && Array.isArray(value)) {
        values.push(JSON.stringify(value));
      } else if (key === 'is_installed' || key === 'is_favorite') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE tuis SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(query);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  deleteTUI(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM tuis WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Category operations
  getAllCategories(): Category[] {
    const stmt = this.db.prepare('SELECT * FROM categories ORDER BY name ASC');
    return stmt.all() as Category[];
  }

  // Launch history operations
  addLaunchHistory(history: Omit<LaunchHistory, 'id' | 'launched_at'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO launch_history (tui_id, exit_code, duration_ms, error_message)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      history.tui_id,
      history.exit_code || null,
      history.duration_ms || null,
      history.error_message || null
    );

    // Update launch count and last_launched_at in tuis table
    this.db.run(
      'UPDATE tuis SET launch_count = launch_count + 1, last_launched_at = CURRENT_TIMESTAMP WHERE id = ?',
      history.tui_id
    );

    return result.lastInsertRowid as number;
  }

  getLaunchHistory(tuiId: number, limit: number = 10): LaunchHistory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM launch_history
      WHERE tui_id = ?
      ORDER BY launched_at DESC
      LIMIT ?
    `);
    return stmt.all(tuiId, limit) as LaunchHistory[];
  }

  getRecentlyLaunchedTUIs(limit: number = 10): TUI[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tuis
      WHERE last_launched_at IS NOT NULL
      ORDER BY last_launched_at DESC
      LIMIT ?
    `);
    const rows = stmt.all(limit) as any[];
    return rows.map(row => this.rowToTUI(row));
  }

  // Settings operations
  getSetting(key: string): Setting | null {
    const stmt = this.db.prepare('SELECT * FROM settings WHERE key = ?');
    return stmt.get(key) as Setting | null;
  }

  setSetting(key: string, value: string, type: 'string' | 'number' | 'boolean' | 'json'): void {
    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value, type)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, type = ?
    `);
    stmt.run(key, value, type, value, type);
  }

  getAllSettings(): Setting[] {
    const stmt = this.db.prepare('SELECT * FROM settings');
    return stmt.all() as Setting[];
  }

  // Helper method to convert database row to TUI object
  private rowToTUI(row: any): TUI {
    return {
      ...row,
      is_installed: row.is_installed === 1,
      is_favorite: row.is_favorite === 1,
      tags: row.tags ? JSON.parse(row.tags) : [],
    };
  }

  // Search TUIs
  searchTUIs(query: string, filters?: { category?: string; source?: string }): TUI[] {
    let sql = `
      SELECT * FROM tuis
      WHERE (name LIKE ? OR description LIKE ? OR tags LIKE ?)
    `;
    const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (filters?.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.source) {
      sql += ' AND source = ?';
      params.push(filters.source);
    }

    sql += ' ORDER BY launch_count DESC, name ASC';

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(row => this.rowToTUI(row));
  }

  // Get random TUI for showcase
  getRandomTUI(filters?: { is_installed?: boolean }): TUI | null {
    let query = 'SELECT * FROM tuis WHERE 1=1';
    const params: any[] = [];

    if (filters?.is_installed !== undefined) {
      query += ' AND is_installed = ?';
      params.push(filters.is_installed ? 1 : 0);
    }

    query += ' ORDER BY RANDOM() LIMIT 1';

    const stmt = this.db.prepare(query);
    const row = stmt.get(...params) as any;
    return row ? this.rowToTUI(row) : null;
  }

  close() {
    this.db.close();
  }
}
