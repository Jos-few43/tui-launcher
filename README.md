# TUI Launcher

A customizable terminal user interface (TUI) launcher and discovery platform for organizing and launching TUI applications. Built with TypeScript, Bun, and OpenTUI.

## Demo

```
┌─────────────────────── TUI Launcher ───────────────────────┐
│                                                             │
│  Tabs: [Installed] [Discover] [Categories] [★Favorites]    │
│        [🎲Showcase*] [Settings] [Search]                    │
│                                                             │
│  ┌────────────────── Showcase ──────────────────┐          │
│  │                                               │          │
│  │     🎬  fftpeg - Modern TUI for ffmpeg       │          │
│  │                                               │          │
│  │     A powerful TUI for video processing      │          │
│  │     with interactive file browser and        │          │
│  │     batch operations support.                │          │
│  │                                               │          │
│  │     Category: Media                          │          │
│  │     Command: fftpeg                          │          │
│  │     Status: ✓ Installed                      │          │
│  │                                               │          │
│  └───────────────────────────────────────────────┘          │
│                                                             │
│  [ Launch/View ]  [ Skip (s) ]  [ ★ Favorite (f) ]        │
│                                                             │
│  Press 1-7 for tabs • q to quit • ? for help              │
└─────────────────────────────────────────────────────────────┘
```

**Features in Action:**
- 🎲 Random TUI discovery on startup with rich metadata
- ⌨️  Full keyboard control (no mouse required)
- 📂 7 pre-configured TUI categories
- ⭐ Favorites system with hotkeys
- 📊 SQLite-backed TUI registry
- 🚀 One-key launching of any TUI

## Overview

TUI Launcher is a "store" and launcher for TUI applications that makes discovering and organizing terminal apps fun and accessible. It provides a tab-based interface for browsing, categorizing, and launching TUIs with keyboard-driven navigation.

## Features (Phase 1 - MVP)

- **Showcase Tab**: Random TUI discovery on startup with ASCII art previews
- **Tab Navigation**: 7 tabs for different views (Installed, Discover, Categories, Favorites, Showcase, Settings, Search)
- **TUI Registry**: SQLite database storing TUI metadata, launch history, and user preferences
- **Keyboard Navigation**: Full keyboard control with vi-style keybindings
- **Favorites System**: Mark and organize favorite TUIs
- **Category Organization**: Browse TUIs by category (Media, AI Tools, Development, System, Productivity)
- **State Management**: Persistent state across sessions using Zustand

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime (v1.0+)

### Setup

```bash
# Install dependencies
bun install

# Run the launcher
bun run dev
# or
bun start
```

On first run, the database will be automatically seeded with 7 builtin TUIs including fftpeg, ai-hub, btop, lazygit, htop, ranger, and ncdu.

## Usage

### Keyboard Shortcuts

#### Global Navigation
- `1-7`: Jump directly to tab (1=Installed, 2=Discover, 3=Categories, 4=Favorites, 5=Showcase, 6=Settings, 7=Search)
- `←/→` or `h/l`: Navigate between tabs
- `q` or `Q`: Quit application
- `F1`: Help (coming soon)

#### Showcase Tab
- `←/→` or `h/l`: Select button (Launch/View, Skip, Favorite)
- `Enter` or `Space`: Activate selected button
- `s` or `S`: Quick skip to next random TUI
- `f` or `F`: Quick toggle favorite

#### Other Tabs
*(Coming in future phases)*

## Project Structure

```
tui-launcher/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Tab manager with keyboard navigation
│   ├── core/                       # Services layer
│   │   ├── database/
│   │   │   └── client.ts           # SQLite database service
│   │   ├── registry/
│   │   │   └── manager.ts          # TUI registry management
│   │   └── state/
│   │       └── store.ts            # Zustand global state
│   ├── tabs/
│   │   └── ShowcaseTab.tsx         # Random TUI showcase (Phase 1)
│   └── types/
│       └── tui.ts                  # TypeScript type definitions
├── database/
│   └── schema.sql                  # Database schema
├── data/
│   └── builtin-tuis.json           # Seed data (7 TUIs)
├── config/
├── package.json
├── tsconfig.json
└── README.md
```

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime with native TypeScript support
- **UI Framework**: [OpenTUI](https://github.com/opentui/opentui) - React-based TUI framework
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight React state
- **Database**: Bun SQLite (native `bun:sqlite`) - Embedded database for TUI registry
- **Search**: [Fuse.js](https://fusejs.io) - Fuzzy search for TUI discovery
- **Language**: TypeScript

## Database Schema

The launcher uses SQLite to persist TUI metadata, user preferences, and usage history:

- **tuis**: Main TUI registry (name, description, command, install status, favorites, launch count, etc.)
- **categories**: Category definitions (7 default categories)
- **favorites**: User-favorited TUIs
- **launch_history**: TUI launch history and analytics
- **sources**: TUI source configurations (GitHub, npm, local, awesome-tuis)
- **settings**: Application settings (theme, keybindings, default tab, etc.)

Database location: `~/.config/tui-launcher/launcher.db`

## Builtin TUIs

The launcher comes pre-seeded with 7 popular TUIs:

1. **fftpeg** (Media) - Modern TUI for ffmpeg video processing (local install)
2. **AI Hub** (AI Tools) - Unified management for AI CLI tools (local install)
3. **btop** (System) - Resource monitor showing CPU, RAM, disk, network
4. **lazygit** (Development) - Simple terminal UI for git commands
5. **htop** (System) - Interactive process viewer
6. **ranger** (Productivity) - Vi-like file manager
7. **ncdu** (System) - NCurses disk usage analyzer

## Roadmap

### Phase 2: Tab Framework (In Progress)
- Implement InstalledTab for quick launching
- Implement remaining tab scaffolds

### Phase 3: Local TUI Discovery & Launcher
- LocalScanner to detect installed TUIs
- TUILauncher to execute TUIs in terminal
- Launch history tracking

### Phase 4: Remote TUI Discovery
- GitHub API integration for TUI search
- awesome-tuis list parser
- npm registry search
- DiscoverTab implementation

### Phase 5: Remaining Tabs
- CategoriesTab with drag-and-drop organization
- FavoritesTab with custom hotkeys
- SettingsTab with theme picker
- SearchTab with fuzzy search

### Phase 6: Polish & Extras
- Theme detection from vim config
- Export/import favorites
- TUI launch analytics
- .tui.json metadata standard
- Animated demos in showcase

## Development

### Running in Development

```bash
bun run dev
```

### Project Goals

- **Discovery**: Make finding new TUI applications fun with random showcases
- **Organization**: Categorize and organize TUIs by purpose
- **Launcher**: Quick keyboard-driven launching of TUIs
- **Extensibility**: Plugin system for custom TUI sources

## Contributing

This is a personal project but suggestions and ideas are welcome! The goal is to create a comprehensive TUI discovery and organization platform.

## License

MIT

## Related Projects

- [fftpeg](https://github.com/yourusername/fftpeg) - Modern TUI for ffmpeg operations
- [ai-hub](https://github.com/yourusername/ai-hub) - Unified AI CLI tools manager
- [OpenTUI](https://github.com/opentui/opentui) - The TUI framework powering this launcher
