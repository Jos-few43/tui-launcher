// Global State Management with Zustand
import { create } from 'zustand';
import type { TUI, Category } from '../../types/tui';

export type TabId = 'installed' | 'discover' | 'categories' | 'favorites' | 'showcase' | 'settings' | 'search';

export interface AppState {
  // Active tab
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // TUI list (cached from database)
  tuis: TUI[];
  setTUIs: (tuis: TUI[]) => void;
  addTUI: (tui: TUI) => void;
  updateTUI: (id: number, updates: Partial<TUI>) => void;
  removeTUI: (id: number) => void;

  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;

  // Showcase
  showcaseTUI: TUI | null;
  setShowcaseTUI: (tui: TUI | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filters
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;

  sourceFilter: string | null;
  setSourceFilter: (source: string | null) => void;

  installedFilter: boolean | null;
  setInstalledFilter: (installed: boolean | null) => void;

  // Theme
  theme: string;
  setTheme: (theme: string) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // Tab state
  activeTab: 'showcase',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // TUI list
  tuis: [],
  setTUIs: (tuis) => set({ tuis }),
  addTUI: (tui) =>
    set((state) => ({
      tuis: [...state.tuis, tui],
    })),
  updateTUI: (id, updates) =>
    set((state) => ({
      tuis: state.tuis.map((tui) => (tui.id === id ? { ...tui, ...updates } : tui)),
    })),
  removeTUI: (id) =>
    set((state) => ({
      tuis: state.tuis.filter((tui) => tui.id !== id),
    })),

  // Categories
  categories: [],
  setCategories: (categories) => set({ categories }),

  // Showcase
  showcaseTUI: null,
  setShowcaseTUI: (tui) => set({ showcaseTUI: tui }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Filters
  categoryFilter: null,
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  sourceFilter: null,
  setSourceFilter: (source) => set({ sourceFilter: source }),

  installedFilter: null,
  setInstalledFilter: (installed) => set({ installedFilter: installed }),

  // Theme
  theme: 'tokyonight',
  setTheme: (theme) => set({ theme }),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Error
  error: null,
  setError: (error) => set({ error }),
}));
