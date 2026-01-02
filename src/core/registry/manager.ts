// TUI Registry Manager - High-level API for TUI management
import { DatabaseService } from '../database/client';
import type { TUI, SearchFilters } from '../../types/tui';
import Fuse from 'fuse.js';

export class RegistryManager {
  constructor(private db: DatabaseService) {}

  /**
   * Add a new TUI to the registry
   */
  add(tui: Omit<TUI, 'id' | 'created_at' | 'updated_at'>): number {
    // Check if TUI with same slug already exists
    const existing = this.db.getTUIBySlug(tui.slug);
    if (existing) {
      throw new Error(`TUI with slug '${tui.slug}' already exists`);
    }

    return this.db.addTUI(tui);
  }

  /**
   * Update an existing TUI
   */
  update(id: number, updates: Partial<TUI>): boolean {
    return this.db.updateTUI(id, updates);
  }

  /**
   * Delete a TUI from the registry
   */
  delete(id: number): boolean {
    return this.db.deleteTUI(id);
  }

  /**
   * Get a TUI by ID
   */
  get(id: number): TUI | null {
    return this.db.getTUI(id);
  }

  /**
   * Get a TUI by slug
   */
  getBySlug(slug: string): TUI | null {
    return this.db.getTUIBySlug(slug);
  }

  /**
   * Get all TUIs with optional filters
   */
  getAll(filters?: SearchFilters): TUI[] {
    return this.db.getAllTUIs({
      is_installed: filters?.is_installed,
      is_favorite: filters?.is_favorite,
      category: filters?.category,
    });
  }

  /**
   * Get installed TUIs only
   */
  getInstalled(): TUI[] {
    return this.db.getAllTUIs({ is_installed: true });
  }

  /**
   * Get favorite TUIs only
   */
  getFavorites(): TUI[] {
    return this.db.getAllTUIs({ is_favorite: true });
  }

  /**
   * Get TUIs by category
   */
  getByCategory(category: string): TUI[] {
    return this.db.getAllTUIs({ category });
  }

  /**
   * Search TUIs with fuzzy search
   */
  search(query: string, filters?: SearchFilters): TUI[] {
    // Get all TUIs matching filters
    let tuis = this.getAll(filters);

    // If no query, return filtered results
    if (!query.trim()) {
      return tuis;
    }

    // Use Fuse.js for fuzzy search
    const fuse = new Fuse(tuis, {
      keys: ['name', 'description', 'tags', 'category'],
      threshold: 0.3, // 0 = exact match, 1 = match anything
      includeScore: true,
    });

    const results = fuse.search(query);
    return results.map(result => result.item);
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(id: number): boolean {
    const tui = this.db.getTUI(id);
    if (!tui) return false;

    return this.db.updateTUI(id, { is_favorite: !tui.is_favorite });
  }

  /**
   * Mark TUI as installed
   */
  markInstalled(id: number, executablePath?: string, version?: string): boolean {
    const updates: Partial<TUI> = {
      is_installed: true,
      installed_version: version,
    };

    if (executablePath) {
      updates.executable_path = executablePath;
    }

    return this.db.updateTUI(id, updates);
  }

  /**
   * Mark TUI as uninstalled
   */
  markUninstalled(id: number): boolean {
    return this.db.updateTUI(id, {
      is_installed: false,
      executable_path: undefined,
      installed_version: undefined,
    });
  }

  /**
   * Get a random TUI for showcase
   */
  getRandom(installedOnly: boolean = false): TUI | null {
    return this.db.getRandomTUI({ is_installed: installedOnly });
  }

  /**
   * Get TUIs by source
   */
  getBySource(source: string): TUI[] {
    return this.db.getAllTUIs().filter(tui => tui.source === source);
  }

  /**
   * Get most launched TUIs
   */
  getMostLaunched(limit: number = 10): TUI[] {
    return this.db
      .getAllTUIs({ is_installed: true })
      .sort((a, b) => b.launch_count - a.launch_count)
      .slice(0, limit);
  }

  /**
   * Get recently launched TUIs
   */
  getRecentlyLaunched(limit: number = 10): TUI[] {
    return this.db
      .getAllTUIs({ is_installed: true })
      .filter(tui => tui.last_launched_at)
      .sort((a, b) => {
        const dateA = new Date(a.last_launched_at || 0);
        const dateB = new Date(b.last_launched_at || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  /**
   * Get launch history for a TUI
   */
  getLaunchHistory(tuiId: number, limit: number = 10) {
    return this.db.getLaunchHistory(tuiId, limit);
  }

  /**
   * Record a launch
   */
  recordLaunch(tuiId: number, exitCode?: number, durationMs?: number): number {
    return this.db.addLaunchHistory({
      tui_id: tuiId,
      exit_code: exitCode,
      duration_ms: durationMs,
    });
  }

  /**
   * Get all categories
   */
  getCategories() {
    return this.db.getAllCategories();
  }

  /**
   * Get statistics
   */
  getStats() {
    const all = this.db.getAllTUIs();
    return {
      total: all.length,
      installed: all.filter(t => t.is_installed).length,
      favorites: all.filter(t => t.is_favorite).length,
      byCategory: all.reduce((acc, tui) => {
        const cat = tui.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySource: all.reduce((acc, tui) => {
        acc[tui.source] = (acc[tui.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
