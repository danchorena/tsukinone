# Implementation Plan: SonicBackground (Tauri + Tailwind v4)

This plan outlines the development of a minimalist background noise application built with Tauri, designed for Windows and Linux.

## Phase 1: Foundation & Environment Setup
**Goal:** Initialize the project with the specific tech stack requested.

1.  **Project Scaffolding:**
    *   Initialize a Tauri project using Vite and React (recommended for Shadcn UI).
    *   **Tauri Config:** Set `resizable: false`, define a standard minimalist window size (e.g., 400x600), and remove the default menu bar.
2.  **Tailwind CSS v4 Integration:**
    *   Install `@tailwindcss/vite` and configure the CSS entry point using the new `@import "tailwindcss";` syntax.
    *   Define a professional, dark-mode-first color palette in the CSS variables.
3.  **Shadcn UI Setup:**
    *   Initialize Shadcn and install core components: `Slider`, `Button`, `Card`, `ScrollArea`, and `Dialog`.
4.  **Audio Engine Selection:**
    *   Evaluate `Howler.js` for the frontend to manage multiple concurrent audio streams, or utilize the native Web Audio API for a zero-dependency minimalist approach.

## Phase 2: Core Playback Engine & UI
**Goal:** Implement the "Play multiple sounds" feature with basic controls.

1.  **The SoundTile Component:**
    *   Create a reusable component containing:
        *   An interactive Icon (Lucide-React).
        *   A vertical or horizontal Shadcn `Slider` for volume (0-100%).
        *   Active/Inactive visual states (glowing borders or opacity shifts).
2.  **Audio Manager Logic:**
    *   Create a React hook or Context to manage a map of active sounds.
    *   Implement "Play on click" logic where multiple sounds can overlap.
    *   Ensure volume sliders react in real-time to the audio gain nodes.
3.  **Built-in Library:**
    *   Include 3-4 high-quality starter sounds (Rain, Storm, White Noise) bundled in the `src-tauri/assets` folder.

## Phase 4: Custom Sounds & File System Integration
**Goal:** Allow users to add their own OGG, MP3, WAV, and FLAC files.

1.  **File Picker Implementation:**
    *   Use Tauri's `dialog` API to allow users to browse their local system for audio files.
2.  **Asset Handling:**
    *   Implement a Rust command to copy selected user files to the Application Data directory (`app_data_dir`). This prevents "broken links" if the user moves the original file.
3.  **Metadata Management:**
    *   Create a JSON manifest in the app data folder to store the mapping of `Custom Name -> File Path -> Chosen Icon`.
4.  **Format Support:**
    *   Ensure the frontend handles various MIME types, specifically focusing on FLAC and OGG compatibility.

## Phase 5: Customization & Refinement
**Goal:** Implement icon selection and polish the UI.

1.  **Icon Browser:**
    *   Implement a `Dialog` that lets users pick from a curated set of Lucide icons for their custom sounds.
2.  **Visual Polish:**
    *   Add Tailwind v4 transitions for hovering over sound tiles.
    *   Implement "Master Mute" and "Stop All" global controls.
3.  **System Tray Integration:**
    *   Add a Tauri system tray icon so the app can run in the background without a window, with a quick "Mute" option from the tray menu.

## Phase 6: Build & Distribution
1.  **Cross-Platform Tuning:**
    *   Configure `tauri.conf.json` for Linux (.deb, .AppImage) and Windows (.msi, .exe).
    *   Design and generate the application icons (512x512).
2.  **Optimization:**
    *   Audit the bundle size to ensure the "minimalist" promise extends to the binary size.
