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
**Goal:** Implement the "Play multiple sounds" feature with independent volume controls and a premium grid interface.

1.  **Audio Context Architecture (`AudioProvider`):**
    *   Use `Howler.js` to manage a global registry of sound loops.
    *   Implement a `SoundState` Map to track `id -> { isPlaying, volume }`.
    *   Functions: `toggleSound(id)`, `setVolume(id, value)`, and `stopAll()`.
    *   Ensure sounds persist across component re-renders.

2.  **The SoundTile Component:**
    *   **Visuals:** A Shadcn `Card` with `backdrop-blur` and a `hover:scale-105` transition.
    *   **States:**
        *   *Active:* Glowing border (`shadow-[0_0_15px_rgba(var(--primary),0.4)]`) and high icon opacity.
        *   *Inactive:* Desaturated icon and low border contrast.
    *   **Control:** Integrated horizontal Shadcn `Slider` for precise volume adjustment (0 to 1.0).

3.  **Hybrid Layout Strategy (Responsive):**
    *   **Desktop/Large View:** Maintain a standard vertical grid with `ScrollArea`.
    *   **Mini/Small View:** Automatically switch to a **Horizontal Carousel** when the window width is narrow.
    *   **CSS Scroll Snap:** Implement `snap-x snap-mandatory` on the container and `snap-center` on tiles to ensure they "lock" into place during horizontal scrolling.
    *   **Visual Cues:** Add edge-fading (mask-image) to indicate more sounds are available to the sides.

4.  **Starter Sound Library:**
    *   Curate 3 loopable HQ assets:
        *   `rain.mp3`: Soft constant rain.
        *   `storm.mp3`: Distant thunder with rain.
        *   `white-noise.mp3`: Clean static for focus.
    *   Place assets in `src/assets/sounds/` for Vite-aware bundling.

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

## Bug Diagnosis & Fix Plan (Current Issues)

### 1. Issue: "Black Screen" on Icon Click
*   **Diagnosis:** Side effects (`howl.play()`) are being executed inside the `setStates` reducer/callback in `AudioContext.tsx`. This causes a React reconciliation error that crashes the entire renderer.
*   **Fix:** Refactor `toggleSound` to trigger the audio side effect *before* or *after* the state update, but never inside the functional update.

### 2. Issue: Carousel not appearing / Static Cards
*   **Diagnosis:** Conflict between Shadcn `ScrollArea` (Radix) and horizontal flexbox. Radix `ScrollArea` suppresses standard overflow-x behaviors.
*   **Fix:** Replace `ScrollArea` with a standard `div` using `overflow-x-auto` for the mini-player mode.
*   **Optimization:** Adjust `SoundTile` width from `280px` to `80vw` for better fit on small windows.

### 3. Issue: Dynamic Icon Access
*   **Diagnosis:** Accessing icons via `Icons[string]` might fail during bundling if names don't match exactly.
*   **Fix:** Create an explicit icon mapping to ensure stability.

## Bug Diagnosis: Hitbox & Interaction Issues

### 1. Issue: First Icon (Rain) sometimes non-responsive
*   **Diagnosis:** The absolute-positioned `ChevronLeft` button and the `w-16` gradient masks are overlapping the first card in the carousel. Even with `pointer-events-none` on the mask, the z-index of the navigation buttons is likely blocking the click.
*   **Secondary Diagnosis:** `justify-center` on an `overflow-x-auto` container is a known CSS anti-pattern that can cause the scroll origin to be inaccessible or hitboxes to shift.

### 2. The Fix Plan:
*   **Carousel Geometry:** Remove `justify-center` and use `px-[12vw]` padding to center the tiles while maintaining a standard scroll start point.
*   **Arrow Refinement:** Move the navigation arrows further to the edges and reduce their hit-area.
*   **Mask Reduction:** Shrink the edge masks to `w-8` to prevent them from reaching into the interactive center of the tiles.
