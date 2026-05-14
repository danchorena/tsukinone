import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Howl } from "howler";
import { Sound, SoundState } from "@/types";
import { SOUND_LIBRARY } from "@/lib/sounds";

interface AudioContextType {
  states: Record<string, SoundState>;
  toggleSound: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
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

  const howls = useRef<Record<string, Howl>>({});

  useEffect(() => {
    // Initialize Howls
    SOUND_LIBRARY.forEach((sound) => {
      howls.current[sound.id] = new Howl({
        src: [sound.src],
        loop: true,
        volume: 0.5,
        html5: true, // Use HTML5 audio for better large file support
      });
    });

    return () => {
      // Cleanup on unmount
      Object.values(howls.current).forEach((howl) => howl.unload());
    };
  }, []);

  const toggleSound = (id: string) => {
    const howl = howls.current[id];
    if (!howl) return;

    try {
      const isCurrentlyPlaying = states[id].isPlaying;
      
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
    if (!howl) return;

    try {
      howl.volume(volume);
      setStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], volume },
      }));
    } catch (error) {
      console.error("Failed to set volume:", error);
    }
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
    <AudioContext.Provider value={{ states, toggleSound, setVolume, stopAll }}>
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
