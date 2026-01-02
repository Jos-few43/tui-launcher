// TUI Launcher Entry Point
import { createRoot } from '@opentui/react';
import { createCliRenderer } from '@opentui/core';
import { DatabaseService } from './core/database/client';
import { RegistryManager } from './core/registry/manager';
import { TUILauncher } from './core/launcher/executor';
import { useStore } from './core/state/store';
import { App } from './App';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';

async function initializeApp() {
  // Ensure config directory exists
  const configDir = join(process.env.HOME || '', '.config', 'tui-launcher');
  try {
    await mkdir(configDir, { recursive: true });
  } catch (err) {
    // Directory might already exist, ignore
  }

  // Initialize database
  const db = new DatabaseService();
  const registry = new RegistryManager(db);
  const launcher = new TUILauncher(db);

  // Check if database is empty (first run)
  const existingTUIs = registry.getAll();
  if (existingTUIs.length === 0) {
    console.log('First run detected. Seeding database with builtin TUIs...');

    // Load builtin TUIs from JSON
    const builtinPath = join(import.meta.dir, '../data/builtin-tuis.json');
    const builtinData = JSON.parse(readFileSync(builtinPath, 'utf-8'));

    // Add each builtin TUI to the database
    for (const tui of builtinData) {
      try {
        registry.add(tui);
        console.log(`Added: ${tui.name}`);
      } catch (err) {
        console.error(`Failed to add ${tui.name}:`, err);
      }
    }

    console.log(`Seeded ${builtinData.length} builtin TUIs`);
  }

  // Load data into store
  const tuis = registry.getAll();
  const categories = registry.getCategories();

  useStore.getState().setTUIs(tuis);
  useStore.getState().setCategories(categories);

  // Get random TUI for showcase
  const showcaseTUI = registry.getRandom();
  if (showcaseTUI) {
    useStore.getState().setShowcaseTUI(showcaseTUI);
  }

  // Load theme setting
  const themeSetting = db.getSetting('theme');
  if (themeSetting) {
    useStore.getState().setTheme(themeSetting.value);
  }

  // Make services available globally for components
  (global as any).registry = registry;
  (global as any).db = db;
  (global as any).launcher = launcher;

  return { db, registry, launcher };
}

async function main() {
  try {
    // Initialize application
    const { db, registry, launcher } = await initializeApp();

    // Create OpenTUI renderer
    const renderer = await createCliRenderer({
      useAlternateScreen: true,
      useMouse: false, // We'll use keyboard only for better TUI experience
      targetFps: 30,
    });

    // Render the app
    const root = createRoot(renderer);
    root.render(<App registry={registry} db={db} launcher={launcher} />);

    // Start the renderer
    renderer.start();

    // Cleanup on exit
    process.on('SIGINT', () => {
      renderer.stop();
      db.close();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      renderer.stop();
      db.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start TUI Launcher:', error);
    process.exit(1);
  }
}

// Run the application
main();
