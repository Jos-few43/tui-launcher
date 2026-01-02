// TUI Launcher Main Application Component
import React, { useState, useEffect } from 'react';
import { useKeyboard } from '@opentui/react';
import { useStore } from './core/state/store';
import type { DatabaseService } from './core/database/client';
import type { RegistryManager } from './core/registry/manager';
import type { TUILauncher } from './core/launcher/executor';
import { ShowcaseTab } from './tabs/ShowcaseTab';

// Import other tabs (we'll create these next)
// import { InstalledTab } from './tabs/InstalledTab';
// import { DiscoverTab } from './tabs/DiscoverTab';
// import { CategoriesTab } from './tabs/CategoriesTab';
// import { FavoritesTab } from './tabs/FavoritesTab';
// import { SettingsTab } from './tabs/SettingsTab';
// import { SearchTab } from './tabs/SearchTab';

interface AppProps {
  registry: RegistryManager;
  db: DatabaseService;
  launcher: TUILauncher;
}

export function App({ registry, db, launcher }: AppProps) {
  const { activeTab, setActiveTab } = useStore();
  const [selectedTabIndex, setSelectedTabIndex] = useState(4); // Start on Showcase (index 4)

  const tabs = [
    { id: 'installed', label: 'Installed', hotkey: '1' },
    { id: 'discover', label: 'Discover', hotkey: '2' },
    { id: 'categories', label: 'Categories', hotkey: '3' },
    { id: 'favorites', label: 'Favorites', hotkey: '4' },
    { id: 'showcase', label: 'Showcase', hotkey: '5' },
    { id: 'settings', label: 'Settings', hotkey: '6' },
    { id: 'search', label: 'Search', hotkey: '7' },
  ];

  // Keyboard navigation
  useKeyboard((key, modifiers) => {
    console.log('Key pressed:', key, 'Modifiers:', modifiers); // Debug log

    // Number keys 1-7 for direct tab access
    const num = parseInt(key);
    if (num >= 1 && num <= 7) {
      setSelectedTabIndex(num - 1);
      setActiveTab(tabs[num - 1].id as any);
      return;
    }

    // Arrow keys or h/l for tab navigation
    if (key === 'left' || key === 'h') {
      const newIndex = (selectedTabIndex - 1 + tabs.length) % tabs.length;
      setSelectedTabIndex(newIndex);
      setActiveTab(tabs[newIndex].id as any);
      return;
    }

    if (key === 'right' || key === 'l') {
      const newIndex = (selectedTabIndex + 1) % tabs.length;
      setSelectedTabIndex(newIndex);
      setActiveTab(tabs[newIndex].id as any);
      return;
    }

    // q to quit
    if (key === 'q') {
      process.exit(0);
      return;
    }
  });

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'showcase':
        return <ShowcaseTab registry={registry} launcher={launcher} />;
      case 'installed':
        return <PlaceholderTab name="Installed" />;
      case 'discover':
        return <PlaceholderTab name="Discover" />;
      case 'categories':
        return <PlaceholderTab name="Categories" />;
      case 'favorites':
        return <PlaceholderTab name="Favorites" />;
      case 'settings':
        return <PlaceholderTab name="Settings" />;
      case 'search':
        return <PlaceholderTab name="Search" />;
      default:
        return <ShowcaseTab registry={registry} launcher={launcher} />;
    }
  };

  return (
    <box flexDirection="column" width="100%" height="100%">
      {/* Header */}
      <box border borderStyle="double" padding={1}>
        <text fg="cyan">
          <strong>🚀 TUI Launcher</strong> - Discover & Launch Terminal Apps
        </text>
      </box>

      {/* Tab Bar */}
      <box flexDirection="row" borderBottom>
        {tabs.map((tab, index) => (
          <box
            key={tab.id}
            padding={1}
            backgroundColor={index === selectedTabIndex ? '#2a4a2a' : 'transparent'}
            fg={index === selectedTabIndex ? 'brightWhite' : 'white'}
          >
            <text>
              {index === selectedTabIndex ? '▸ ' : '  '}
              {tab.label} [{tab.hotkey}]
            </text>
          </box>
        ))}
      </box>

      {/* Tab Content */}
      <box flexGrow={1}>
        {renderTabContent()}
      </box>

      {/* Footer / Status Bar */}
      <box border borderStyle="single" padding={1}>
        <text fg="dim">
          ←→/h l: Navigate | 1-7: Jump to tab | q: Quit | F1: Help
        </text>
      </box>
    </box>
  );
}

// Temporary placeholder component for tabs we haven't built yet
function PlaceholderTab({ name }: { name: string }) {
  return (
    <box
      flexDirection="column"
      padding={4}
      alignItems="center"
      justifyContent="center"
      height="100%"
    >
      <text fg="yellow">
        <strong>{name} Tab</strong>
      </text>
      <text fg="dim">Coming soon...</text>
    </box>
  );
}
