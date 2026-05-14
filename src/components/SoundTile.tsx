import React from "react";
import * as Icons from "lucide-react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Sound } from "@/types";
import { useAudio } from "@/context/AudioContext";

interface SoundTileProps {
  sound: Sound;
}

const ICON_MAP: Record<string, React.ElementType> = {
  CloudRain: Icons.CloudRain,
  CloudLightning: Icons.CloudLightning,
  Wind: Icons.Wind,
  Music: Icons.Music,
};

export const SoundTile: React.FC<SoundTileProps> = ({ sound }) => {
  const { states, toggleSound, setVolume } = useAudio();
  const state = states[sound.id];
  
  const IconComponent = ICON_MAP[sound.icon] || Icons.Music;

  return (
    <Card
      className={cn(
        "group relative flex flex-col items-center justify-between p-6 transition-all duration-500 ease-out",
        "w-[75vw] shrink-0 snap-center sm:w-auto sm:shrink-1 sm:snap-align-none",
        "border-zinc-800 bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-800/60",
        state.isPlaying && "border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.15)]"
      )}
    >
      {/* Icon Button */}
      <button
        onClick={() => toggleSound(sound.id)}
        className={cn(
          "mb-4 rounded-full p-3 transition-all duration-300",
          state.isPlaying 
            ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" 
            : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
        )}
      >
        <IconComponent className="h-6 w-6" />
      </button>

      {/* Label */}
      <span className={cn(
        "mb-4 text-sm font-medium tracking-wide transition-colors",
        state.isPlaying ? "text-white" : "text-zinc-500"
      )}>
        {sound.name}
      </span>

      {/* Volume Slider */}
      <div className="w-full px-2">
        <Slider
          value={[state.volume * 100]}
          max={100}
          step={1}
          onValueChange={(vals) => setVolume(sound.id, vals[0] / 100)}
          className={cn(
            "transition-opacity duration-300",
            state.isPlaying ? "opacity-100" : "opacity-30 group-hover:opacity-60"
          )}
        />
      </div>
      
      {/* Active Indicator */}
      {state.isPlaying && (
        <div className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
        </div>
      )}
    </Card>
  );
};
