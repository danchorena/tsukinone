import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { Howl } from "howler";
import { SoundState } from "@/types";
import { SOUND_LIBRARY } from "@/lib/sounds";

interface AudioContextType {
  states: Record<string, SoundState>;
  masterVolume: number;
  isMasterMuted: boolean;
  toggleSound: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  toggleMasterMute: () => void;
  stopAll: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [states, setStates] = useState<Record<string, SoundState>>(() => {
    const initial: Record<string, SoundState> = {};
    SOUND_LIBRARY.forEach((sound) => {
      initial[sound.id] = { isPlaying: false, volume: 0.5 };
    });
    return initial;
  });

  const [masterVolume, setMasterVolumeState] = useState(1.0);
  const [isMasterMuted, setIsMasterMuted] = useState(false);

  // Howl instances registry
  const howls = useRef<Record<string, Howl>>({});

  // Lazy loader for Howl instances
  const getHowl = useCallback((id: string): Howl | null => {
    if (howls.current[id]) return howls.current[id];

    const sound = SOUND_LIBRARY.find((s) => s.id === id);
    if (!sound) return null;

    const newHowl = new Howl({
      src: [sound.src],
      loop: true,
      volume: states[id].volume * (isMasterMuted ? 0 : masterVolume),
      html5: false, // Use Web Audio API for gapless looping
      preload: true,
    });

    howls.current[id] = newHowl;
    return newHowl;
  }, [masterVolume, isMasterMuted, states]);

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
        const targetVolume = states[id].volume * (isMasterMuted ? 0 : masterVolume);
        howl.volume(targetVolume);
      }
    });
  }, [masterVolume, isMasterMuted, states]);

  const toggleSound = (id: string) => {
    const howl = getHowl(id);
    if (!howl) return;

    try {
      const isCurrentlyPlaying = states[id].isPlaying;
      
      if (!isCurrentlyPlaying) {
        howl.play();
      } else {
        // Use fade out for smoother stop if preferred, or just stop
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
    // No need to initialize if not already exists (user hasn't played it yet)
    
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

  return (
    <AudioContext.Provider value={{ 
      states, 
      masterVolume, 
      isMasterMuted, 
      toggleSound, 
      setVolume, 
      setMasterVolume, 
      toggleMasterMute, 
      stopAll 
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
