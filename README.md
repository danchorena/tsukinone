# 🌙 Tsukinone (つきのね)

**Tsukinone** is a premium, minimalist background sound application designed to help you focus, relax, or sleep. Built with **Tauri**, **React**, and **Rust**, it offers a lightweight yet powerful experience for managing your ambient environment.

## ✨ Features

- **High-Fidelity Ambient Sounds:** A curated collection of built-in sounds (Rain, Storm, White Noise, etc.) with high-quality, gapless looping.
- **Individual Volume Control:** Mix multiple sounds simultaneously to create your perfect soundscape.
- **Custom Sound Support:** Add your own local audio files, assign them custom icons from the Lucide library, and manage your personal library.
- **Native Desktop Integration:**
    - **System Tray:** Minimize to tray for uninterrupted focus.
    - **Global Mute:** Quickly silence all sounds via the tray menu.
    - **Background Playback:** Keeps playing even when the window is closed.
- **Premium UI/UX:**
    - **Glassmorphic Design:** A sleek, modern aesthetic that blends beautifully with your desktop.
    - **Responsive Layout:** Transitions from a smooth horizontal carousel on small windows to a dynamic multi-column grid on larger screens.
    - **Real-time Search:** Instantly find the sound you're looking for.
- **Persistence:** Remembers your volume levels and active sounds across sessions.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS v4, Framer Motion (for animations)
- **UI Components:** Shadcn UI (Radix UI)
- **Audio Engine:** Howler.js (Web Audio API)
- **Backend:** Rust, Tauri v2
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites

- **Rust:** [Install Rust](https://www.rust-lang.org/tools/install)
- **Node.js:** [Install Node.js](https://nodejs.org/) (LTS recommended)
- **Tauri Dependencies:** Follow the [Tauri Setup Guide](https://tauri.app/v1/guides/getting-started/prerequisites) for your OS.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/danchorena/tsukinone.git
   cd tsukinone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

4. Build for production:
   ```bash
   npm run tauri build
   ```

## 📂 Project Structure

```text
├── src/                # Frontend React application
│   ├── components/     # UI Components (SoundTile, AddSound, etc.)
│   ├── context/        # AudioContext for state & playback
│   ├── assets/         # Static assets and built-in sounds
│   └── lib/            # Utility functions
├── src-tauri/          # Backend Rust application
│   ├── src/            # Rust source code (Main, Lib, Commands)
│   └── capabilities/   # Tauri permission configurations
├── public/             # Public assets
└── package.json        # Node dependencies and scripts
```

## 🎨 Design Philosophy

Tsukinone (Sound of the Moon) is built on the principle of **unobtrusive utility**. The interface is designed to be felt, not just seen, using subtle micro-interactions, soft blurs, and a dark-first color palette that reduces eye strain during late-night deep work sessions.

---

## 💌 A Note from Tsukinone

This app was made for you, so you have an easy to use tool to play background sounds and noises to fit your mood, help you focus, work, study, or simply find your rhythm. 

Thank you for choosing **Tsukinone**. If it helps you in your daily life, please consider spreading the word!

---

Handcrafted with ❤️ for the dreamers and the focus-seekers.
