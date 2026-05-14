# Implementation Plan: SonicBackground (Tauri + Tailwind v4)

This plan outlines the development of a minimalist background noise application built with Tauri, designed for Windows and Linux, with a focus on premium aesthetics and robust local-first functionality.

## Phase 1: Foundation & Environment Cleanup
**Goal:** Align the project with the desired specs and fix initial inconsistencies.

1.  **Configuration Fixes:**
    *   Update `tauri.conf.json`: Set `resizable: true` (to allow full-screen experience), set `productName` to "Tsukinone", and ensure the identifier is correct.
2.  **Asset Normalization:**
    *   Standardize starter sounds: Convert `rain.mp3`, `storm.aiff`, and `white-noise.wav` to a unified format (Ogg/Opus recommended for Linux/Web, or high-bitrate MP3) to ensure consistent looping and load times.
3.  **Shadcn UI Audit:**
    *   Ensure `Slider`, `Button`, `Card`, and `Dialog` are properly themed with the dark-mode-first palette.

## Phase 2: Advanced Audio Engine
**Goal:** Implement a high-performance, gapless audio registry.

1.  **Audio Context Refactor (`AudioProvider`):**
    *   **Gapless Looping:** Switch `Howler.js` to use Web Audio API (`html5: false`) for short loopable assets to ensure no audible gaps.
    *   **Lazy Loading:** Refactor to load audio buffers only when the sound is first activated, reducing initial memory footprint.
    *   **Dynamic Registry:** Allow the `states` and `howls` objects to expand dynamically as custom sounds are added.
2.  **Master Controls:**
    *   Implement "Master Mute" and "Fade All" logic that smoothly ramps volume down/up.

## Phase 2: Core Refactor & Responsiveness
**Status:** ✅ COMPLETED

1.  **Grid System Overhaul:**
    *   Implemented a dynamic grid system using Tailwind breakpoints:
        *   `xl`: 6 columns
        *   `lg`: 4 columns
        *   `md`: 3 columns
        *   `sm`: 2 columns
        *   `max-sm`: Horizontal Carousel
    *   **Fixed**: Transition glitch (6-column flash) by removing `transition-all` on the main container.
    *   **Fixed**: Top border clipping by adding `pt-4` padding within the carousel container.
2.  **Responsive Header:**
    *   Refactored header to show full controls and text down to `640px`.
    *   Implemented a premium Hamburger Menu for screens below `640px`.
    *   Added a glassmorphic mobile dropdown with integrated search and audio controls.
3.  **Search Functionality:**
    *   Integrated search in both desktop header and mobile dropdown.
    *   Implemented real-time filtering logic.

## Phase 3: Premium UI & Animations
**Goal:** Enhance the visual experience with micro-interactions.

1.  **SoundTile V2:**
    *   Add a "Pulse" animation to the icon when active.
    *   Enhance `backdrop-blur` and add subtle gradients to the active state.
2.  **Layout Refinements:**
    *   Ensure the edge-fading masks and carousel indicators are perfectly synchronized with the scroll state.

## Phase 4: Custom Sounds & Rust Integration
**Goal:** Securely manage user-provided audio files.

1.  **Rust Command Implementation:**
    *   `register_custom_sound`: Triggered by frontend picker. Copies file to `AppConfig/sounds/`, generates a unique ID, and updates `manifest.json`.
    *   `load_manifest`: Reads the JSON mapping of IDs, names, icons, and local paths.
    *   `delete_sound`: Safely removes the file and manifest entry.
2.  **Frontend Integration:**
    *   Add an "Add Sound" tile to the grid.
    *   Implement a `Dialog` with an **Icon Browser** (searchable Lucide icons) for custom entries.

## Phase 5: Persistence & System Integration
**Goal:** Make the app feel like a native background utility.

1.  **State Persistence:**
    *   Save volume levels and "active" sound IDs to `localStorage` or the Rust manifest so the "atmosphere" is restored on launch.
2.  **System Tray Integration:**
    *   Implement a Tauri tray menu: `Toggle Mute`, `Show/Hide Window`, and `Quit`.
    *   "Close to Tray" behavior: Clicking the window 'X' hides the window instead of killing the process.

## Phase 6: Polish & Distribution
1.  **Performance Audit:**
    *   Check memory leaks during frequent toggle/volume changes.
    *   Optimize bundle size by stripping unused Lucide icons.
2.  **Build Pipeline:**
    *   Configure CI/CD for `.deb`, `.AppImage` (Linux) and `.msi` (Windows).
    *   Generate premium icons (512x512) and splash screens.