import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Howl, Howler } from "howler";
import { Sound, SoundState } from "@/types";
import { SOUND_LIBRARY } from "@/lib/sounds";
import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface AudioContextType {
  sounds: Sound[];
  states: Record<string, SoundState>;
  masterVolume: number;
  isMasterMuted: boolean;
  toggleSound: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  toggleMasterMute: () => void;
  playActive: () => void;
  stopAll: () => void;
  refreshManifest: () => Promise<void>;
  registerSound: (name: string, icon: string, sourcePath: string) => Promise<void>;
  deleteSound: (id: string) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customSounds, setCustomSounds] = useState<Sound[]>([]);
  const [states, setStates] = useState<Record<string, SoundState>>(() => {
    try {
      const saved = localStorage.getItem("tsukinone_states");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sanitize: turn off any sounds that were saved as playing but with 0 volume
        Object.keys(parsed).forEach((id) => {
          if (parsed[id].isPlaying && parsed[id].volume === 0) {
            parsed[id].isPlaying = false;
          }
        });
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  });

  const [masterVolume, setMasterVolumeState] = useState(() => {
    const saved = localStorage.getItem("tsukinone_masterVolume");
    return saved ? parseFloat(saved) : 1.0;
  });
  const [isMasterMuted, setIsMasterMuted] = useState(() => {
    const saved = localStorage.getItem("tsukinone_isMasterMuted");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("tsukinone_states", JSON.stringify(states));
  }, [states]);

  useEffect(() => {
    localStorage.setItem("tsukinone_masterVolume", masterVolume.toString());
  }, [masterVolume]);

  useEffect(() => {
    localStorage.setItem("tsukinone_isMasterMuted", isMasterMuted.toString());
  }, [isMasterMuted]);

  useEffect(() => {
    if (!(window as any).__TAURI_INTERNALS__) return;
    
    const unlisten = listen("toggle-mute", () => {
      setIsMasterMuted((prev) => !prev);
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  // Combined sounds list
  const sounds = useMemo(() => [...SOUND_LIBRARY, ...customSounds], [customSounds]);

  // Howl instances registry
  const howls = useRef<Record<string, Howl>>({});
  // Track stop timers to avoid stale closures and allow cancellation
  const stopTimers = useRef<Record<string, any>>({});

  // Initialize states for built-in sounds
  useEffect(() => {
    setStates((prev) => {
      const next = { ...prev };
      SOUND_LIBRARY.forEach((sound) => {
        if (!next[sound.id]) {
          next[sound.id] = { isPlaying: false, volume: 0.5 };
        }
      });
      return next;
    });
  }, []);

  const refreshManifest = useCallback(async () => {
    if (!(window as any).__TAURI_INTERNALS__) return;
    try {
      const manifest: { custom_sounds: any[] } = await invoke("load_manifest");
      const mappedSounds: Sound[] = manifest.custom_sounds.map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
        src: convertFileSrc(s.path),
      }));
      setCustomSounds(mappedSounds);
      
      setStates((prev) => {
        const next = { ...prev };
        mappedSounds.forEach((sound) => {
          if (!next[sound.id]) {
            next[sound.id] = { isPlaying: false, volume: 0.5 };
          }
        });
        return next;
      });
    } catch (error) {
      console.error("Failed to load manifest:", error);
    }
  }, []);

  useEffect(() => {
    // Initial load
    refreshManifest();
  }, [refreshManifest]);

  const registerSound = async (name: string, icon: string, sourcePath: string) => {
    if (!(window as any).__TAURI_INTERNALS__) return;
    await invoke("register_custom_sound", { name, icon, sourcePath });
    await refreshManifest();
  };

  const deleteSound = async (id: string) => {
    // Stop sound if playing
    if (howls.current[id]) {
      howls.current[id].stop();
      howls.current[id].unload();
      delete howls.current[id];
    }
    
    if (!(window as any).__TAURI_INTERNALS__) return;
    await invoke("delete_sound", { id });
    await refreshManifest();
    
    setStates((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Lazy loader for Howl instances
  const getHowl = useCallback((id: string): Howl | null => {
    if (howls.current[id]) return howls.current[id];

    const sound = sounds.find((s) => s.id === id);
    if (!sound) return null;

    const newHowl = new Howl({
      src: [sound.src],
      loop: true,
      volume: (states[id]?.volume ?? 0.5) * (isMasterMuted ? 0 : masterVolume),
      html5: false, // Use Web Audio API for gapless looping
      preload: true,
    });

    howls.current[id] = newHowl;
    return newHowl;
  }, [masterVolume, isMasterMuted, states, sounds]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      Object.values(howls.current).forEach((howl) => howl.unload());
      Object.values(stopTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Update all volumes when master volume or mute changes
  useEffect(() => {
    Object.keys(howls.current).forEach((id) => {
      const howl = howls.current[id];
      if (howl) {
        const targetVolume = (states[id]?.volume ?? 0.5) * (isMasterMuted ? 0 : masterVolume);
        howl.volume(targetVolume);
      }
    });
  }, [masterVolume, isMasterMuted, states]);

  const toggleSound = (id: string) => {
    const howl = getHowl(id);
    if (!howl) return;

    try {
      const isCurrentlyPlaying = states[id]?.isPlaying;
      let baseVolume = states[id]?.volume ?? 0.5;
      
      // Auto-restore volume to 50% if turning on a silent sound
      if (!isCurrentlyPlaying && baseVolume === 0) {
        baseVolume = 0.5;
      }
      
      const finalVolume = baseVolume * (isMasterMuted ? 0 : masterVolume);
      
      if (!isCurrentlyPlaying) {
        // Cancel any pending stop timer
        if (stopTimers.current[id]) {
          clearTimeout(stopTimers.current[id]);
          delete stopTimers.current[id];
        }
        
        howl.volume(0);
        howl.play();
        howl.fade(0, finalVolume, 500);
      } else {
        howl.fade(howl.volume(), 0, 500);
        stopTimers.current[id] = setTimeout(() => {
          howl.stop();
          delete stopTimers.current[id];
        }, 500);
      }

      setStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], isPlaying: !isCurrentlyPlaying, volume: baseVolume },
      }));
    } catch (error) {
      console.error("Failed to toggle sound:", error);
    }
  };

  const setVolume = (id: string, volume: number) => {
    const howl = howls.current[id];
    
    setStates((prev) => {
      const isCurrentlyPlaying = prev[id]?.isPlaying ?? false;
      // Auto turn off if volume reaches 0
      const shouldPlay = volume === 0 ? false : isCurrentlyPlaying;
      
      return {
        ...prev,
        [id]: { ...prev[id], volume, isPlaying: shouldPlay },
      };
    });

    if (howl) {
      // Direct volume change for slider interaction is better for feedback
      howl.volume(volume * (isMasterMuted ? 0 : masterVolume));
      
      // If we auto-turned it off, stop the sound to save resources
      if (volume === 0) {
        if (stopTimers.current[id]) {
          clearTimeout(stopTimers.current[id]);
          delete stopTimers.current[id];
        }
        howl.stop();
      }
    }
  };

  const setMasterVolume = (volume: number) => {
    setMasterVolumeState(volume);
  };

  const toggleMasterMute = () => {
    setIsMasterMuted(!isMasterMuted);
  };

  const stopAll = () => {
    Object.keys(howls.current).forEach((id) => {
      const howl = howls.current[id];
      if (howl) {
        // Cancel any pending timers for this sound
        if (stopTimers.current[id]) {
          clearTimeout(stopTimers.current[id]);
        }
        
        howl.fade(howl.volume(), 0, 1000);
        stopTimers.current[id] = setTimeout(() => {
          howl.stop();
          delete stopTimers.current[id];
        }, 1000);
      }
    });
    
    setStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = { ...next[id], isPlaying: false };
      });
      return next;
    });
  };

  const playActive = () => {
    const hasActive = Object.values(states).some(s => s.isPlaying);
    if (!hasActive) return;

    if (Howler.ctx && Howler.ctx.state === "suspended") {
      Howler.ctx.resume();
    }

    Object.keys(states).forEach((id) => {
      if (states[id]?.isPlaying) {
        const howl = getHowl(id);
        if (howl && !howl.playing()) {
          const targetVolume = (states[id]?.volume ?? 0.5) * (isMasterMuted ? 0 : masterVolume);
          howl.volume(0);
          howl.play();
          howl.fade(0, targetVolume, 500);
        }
      }
    });
  };

  const initialPlayDone = useRef(false);

  useEffect(() => {
    if (!initialPlayDone.current && sounds.length >= SOUND_LIBRARY.length) {
      const timer = setTimeout(() => {
        Object.keys(states).forEach((id) => {
          if (states[id]?.isPlaying) {
            const howl = getHowl(id);
            if (howl && !howl.playing()) {
              const targetVolume = (states[id]?.volume ?? 0.5) * (isMasterMuted ? 0 : masterVolume);
              howl.volume(0);
              howl.play();
              howl.fade(0, targetVolume, 2000); // 2 second soft entry
            }
          }
        });
      }, 800);
      initialPlayDone.current = true;
      return () => clearTimeout(timer);
    }
  }, [sounds, states, getHowl, masterVolume, isMasterMuted]);

  return (
    <AudioContext.Provider value={{ 
      sounds,
      states, 
      masterVolume, 
      isMasterMuted, 
      toggleSound, 
      setVolume, 
      setMasterVolume, 
      toggleMasterMute, 
      playActive,
      stopAll,
      refreshManifest,
      registerSound,
      deleteSound
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
