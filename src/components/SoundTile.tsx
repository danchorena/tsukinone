import React from "react";
import { Trash2 } from "lucide-react";
import { IconRenderer } from "@/components/IconRenderer";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Sound } from "@/types";
import { useAudio } from "@/context/AudioContext";
import { SOUND_LIBRARY } from "@/lib/sounds";

interface SoundTileProps {
  sound: Sound;
}

export const SoundTile: React.FC<SoundTileProps> = ({ sound }) => {
  const { states, toggleSound, setVolume, deleteSound, isPaused } = useAudio();
  const state = states[sound.id] || { isPlaying: false, volume: 0.5 };
  
  const isBuiltIn = SOUND_LIBRARY.some(s => s.id === sound.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${sound.name}"?`)) {
      deleteSound(sound.id);
    }
  };

  return (
    <Card
      className={cn(
        "group relative flex flex-col items-center justify-between p-6 transition-[background-color,border-color,box-shadow,transform,ring] duration-500 ease-out",
        "max-sm:w-[75vw] max-sm:shrink-0 max-sm:snap-center sm:w-auto sm:shrink-1 sm:snap-align-none",
        "border-zinc-800 bg-zinc-900/20 backdrop-blur-xl hover:bg-zinc-800/40 hover:border-zinc-700",
        state.isPlaying && "border-primary/40 bg-primary/5 shadow-primary-lg ring-1 ring-primary/20"
      )}
    >
      {/* Delete Button (Custom Sounds Only) */}
      {!isBuiltIn && (
        <button
          onClick={handleDelete}
          className="absolute top-3 left-3 h-8 w-8 flex items-center justify-center rounded-full bg-zinc-900/50 text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-500 transition-all duration-300 z-10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      {/* Icon Button */}
      <div className="relative mb-4">
        <button
          onClick={() => toggleSound(sound.id)}
          className={cn(
            "rounded-full p-4 transition-all duration-500",
            state.isPlaying 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 animate-pulse-subtle" 
              : "bg-zinc-800/30 text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200"
          )}
        >
          <IconRenderer name={sound.icon} className="h-6 w-6" />
        </button>

        {/* Mini Wave Visualizer (only when playing and not globally paused) */}
        {state.isPlaying && !isPaused && (
          <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="h-1 w-0.5 rounded-full bg-primary-foreground/60 animate-bounce"
                style={{ animationDelay: `${i * 0.1}s`, animationDuration: "0.6s" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Label */}
      <span className={cn(
        "mb-5 text-sm font-semibold tracking-tight transition-colors duration-500",
        state.isPlaying ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
      )}>
        {sound.name}
      </span>

      {/* Volume Slider */}
      <div className="w-full px-1">
        <Slider
          value={[state.volume * 100]}
          max={100}
          step={1}
          onValueChange={(vals) => setVolume(sound.id, vals[0] / 100)}
          className={cn(
            "transition-all duration-500",
            state.isPlaying ? "opacity-100 scale-105" : "opacity-20 group-hover:opacity-50"
          )}
        />
      </div>
      
      {/* Active Indicator Dot */}
      <div className={cn(
        "absolute top-3 right-3 h-1.5 w-1.5 rounded-full transition-all duration-500",
        state.isPlaying ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] scale-100" : "bg-transparent scale-0"
      )} />
    </Card>
  );
};
