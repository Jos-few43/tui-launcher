// Showcase Tab - Display random TUI with ASCII art
import React, { useState, useEffect } from 'react';
import { useKeyboard } from '@opentui/react';
import { useStore } from '../core/state/store';
import type { RegistryManager } from '../core/registry/manager';
import type { TUILauncher } from '../core/launcher/executor';
import type { TUI } from '../types/tui';

interface ShowcaseTabProps {
  registry: RegistryManager;
  launcher: TUILauncher;
}

export function ShowcaseTab({ registry, launcher }: ShowcaseTabProps) {
  const { showcaseTUI, setShowcaseTUI } = useStore();
  const [selectedButton, setSelectedButton] = useState(0); // 0 = Launch, 1 = Skip, 2 = Favorite

  // Handle keyboard navigation
  useKeyboard((key) => {
    console.log('ShowcaseTab key:', key); // Debug log

    if (key === 'left' || key === 'h') {
      setSelectedButton((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key === 'right' || key === 'l') {
      setSelectedButton((prev) => Math.min(2, prev + 1));
      return;
    }

    if (key === 'return' || key === ' ') {
      handleButtonAction(selectedButton);
      return;
    }

    if (key === 's') {
      // Quick skip
      loadRandomTUI();
      return;
    }

    if (key === 'f') {
      // Quick favorite toggle
      if (showcaseTUI?.id) {
        registry.toggleFavorite(showcaseTUI.id);
        // Reload TUI to get updated favorite status
        const updated = registry.get(showcaseTUI.id);
        if (updated) {
          setShowcaseTUI(updated);
        }
      }
      return;
    }
  });

  const loadRandomTUI = () => {
    const randomTUI = registry.getRandom(false); // Get any TUI (not just installed)
    if (randomTUI) {
      setShowcaseTUI(randomTUI);
      setSelectedButton(0); // Reset button selection
    }
  };

  const handleButtonAction = async (buttonIndex: number) => {
    if (!showcaseTUI) return;

    switch (buttonIndex) {
      case 0: // Launch
        if (showcaseTUI.is_installed && showcaseTUI.command && showcaseTUI.id) {
          try {
            // Launch TUI in detached mode (won't wait for it to finish)
            await launcher.launch(showcaseTUI, { waitForExit: false });
            // Skip to next TUI after launching
            loadRandomTUI();
          } catch (error) {
            console.error(`Failed to launch ${showcaseTUI.name}:`, error);
          }
        } else {
          // Not installed, just show the TUI info (already displayed)
          // Could potentially open repo URL or show install instructions
        }
        break;
      case 1: // Skip
        loadRandomTUI();
        break;
      case 2: // Favorite
        if (showcaseTUI.id) {
          registry.toggleFavorite(showcaseTUI.id);
          const updated = registry.get(showcaseTUI.id);
          if (updated) {
            setShowcaseTUI(updated);
          }
        }
        break;
    }
  };

  // Load random TUI on mount if none selected
  useEffect(() => {
    if (!showcaseTUI) {
      loadRandomTUI();
    }
  }, []);

  if (!showcaseTUI) {
    return (
      <box flexDirection="column" padding={2} alignItems="center" justifyContent="center" height="100%">
        <text fg="yellow">No TUIs available in registry</text>
        <text fg="dim">Add some TUIs to get started!</text>
      </box>
    );
  }

  const buttons = [
    { label: showcaseTUI.is_installed ? 'Launch' : 'View', enabled: true },
    { label: 'Skip', enabled: true },
    { label: showcaseTUI.is_favorite ? '★ Favorited' : '☆ Favorite', enabled: true },
  ];

  return (
    <box flexDirection="column" padding={2} height="100%">
      {/* Title */}
      <box padding={1}>
        <text fg="cyan">
          <strong>🎯 Discover TUIs - Random Showcase</strong>
        </text>
      </box>

      {/* Main content area */}
      <box flexDirection="row" flexGrow={1} gap={2}>
        {/* Left: ASCII Art */}
        <box
          flexBasis="50%"
          border
          borderStyle="rounded"
          padding={2}
          alignItems="center"
          justifyContent="center"
        >
          {showcaseTUI.ascii_art ? (
            <text fg="green">{showcaseTUI.ascii_art}</text>
          ) : (
            <box flexDirection="column" alignItems="center" gap={1}>
              <text fg="yellow">
                <strong>{showcaseTUI.name.toUpperCase()}</strong>
              </text>
              <text fg="dim">No ASCII art available</text>
            </box>
          )}
        </box>

        {/* Right: TUI Info */}
        <box flexBasis="50%" flexDirection="column" gap={1}>
          {/* Name */}
          <box border borderStyle="single" padding={1}>
            <text fg="brightCyan">
              <strong>{showcaseTUI.name}</strong>
            </text>
          </box>

          {/* Category & Source */}
          <box flexDirection="row" gap={2}>
            {showcaseTUI.category && (
              <box border borderStyle="single" padding={1}>
                <text fg="yellow">📁 {showcaseTUI.category}</text>
              </box>
            )}
            <box border borderStyle="single" padding={1}>
              <text fg="blue">
                {showcaseTUI.is_installed ? '✓ Installed' : '○ Not Installed'}
              </text>
            </box>
          </box>

          {/* Description */}
          <box border borderStyle="rounded" padding={2} flexGrow={1}>
            <box flexDirection="column" gap={1}>
              <text fg="white">{showcaseTUI.description}</text>
              {showcaseTUI.long_description && (
                <text fg="dim">{showcaseTUI.long_description}</text>
              )}
            </box>
          </box>

          {/* Tags */}
          {showcaseTUI.tags && showcaseTUI.tags.length > 0 && (
            <box flexDirection="row" gap={1}>
              {showcaseTUI.tags.slice(0, 5).map((tag, i) => (
                <text key={i} fg="magenta">
                  #{tag}
                </text>
              ))}
            </box>
          )}

          {/* Stats */}
          {showcaseTUI.launch_count > 0 && (
            <box>
              <text fg="dim">Launched {showcaseTUI.launch_count} times</text>
            </box>
          )}
        </box>
      </box>

      {/* Action Buttons */}
      <box flexDirection="row" justifyContent="center" gap={2} padding={2}>
        {buttons.map((button, index) => (
          <box
            key={index}
            border
            borderStyle={index === selectedButton ? 'double' : 'single'}
            padding={1}
            backgroundColor={index === selectedButton ? '#2a4a2a' : 'transparent'}
            fg={index === selectedButton ? 'brightWhite' : 'white'}
          >
            <text>
              {index === selectedButton ? '▸ ' : '  '}
              {button.label}
            </text>
          </box>
        ))}
      </box>

      {/* Help text */}
      <box padding={1}>
        <text fg="dim">
          ←→: Select button | Enter: Activate | s: Skip | f: Toggle favorite
        </text>
      </box>
    </box>
  );
}
