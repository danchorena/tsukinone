import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Howl } from "howler";
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
      return saved ? JSON.parse(saved) : {};
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
      volume: (states[id]?.volume || 0.5) * (isMasterMuted ? 0 : masterVolume),
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
    };
  }, []);

  // Update all volumes when master volume or mute changes
  useEffect(() => {
    Object.keys(howls.current).forEach((id) => {
      const howl = howls.current[id];
      if (howl) {
        const targetVolume = (states[id]?.volume || 0.5) * (isMasterMuted ? 0 : masterVolume);
        howl.volume(targetVolume);
      }
    });
  }, [masterVolume, isMasterMuted, states]);

  const toggleSound = (id: string) => {
    const howl = getHowl(id);
    if (!howl) return;

    try {
      const isCurrentlyPlaying = states[id]?.isPlaying;
      
      if (!isCurrentlyPlaying) {
        howl.play();
      } else {
        howl.stop();
      }

      setStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], isPlaying: !isCurrentlyPlaying },
      }));
    } catch (error) {
      console.error("Failed to toggle sound:", error);
    }
  };

  const setVolume = (id: string, volume: number) => {
    const howl = howls.current[id];
    
    setStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], volume },
    }));

    if (howl) {
      howl.volume(volume * (isMasterMuted ? 0 : masterVolume));
    }
  };

  const setMasterVolume = (volume: number) => {
    setMasterVolumeState(volume);
  };

  const toggleMasterMute = () => {
    setIsMasterMuted(!isMasterMuted);
  };

  const stopAll = () => {
    Object.values(howls.current).forEach((howl) => howl.stop());
    setStates((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = { ...next[id], isPlaying: false };
      });
      return next;
    });
  };

  const initialPlayDone = useRef(false);

  useEffect(() => {
    if (!initialPlayDone.current && sounds.length >= SOUND_LIBRARY.length) {
      setTimeout(() => {
        Object.keys(states).forEach((id) => {
          if (states[id]?.isPlaying) {
            const howl = getHowl(id);
            if (howl && !howl.playing()) {
              howl.play();
            }
          }
        });
      }, 500);
      initialPlayDone.current = true;
    }
  }, [sounds, states, getHowl]);

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
