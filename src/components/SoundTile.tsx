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
  Flame: Icons.Flame,
  Trees: Icons.Trees,
  TrainFront: Icons.TrainFront,
  Waves: Icons.Waves,
  TrainTrack: Icons.TrainTrack,
  Palmtree: Icons.Palmtree,
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
        "max-xs:w-[75vw] max-xs:shrink-0 max-xs:snap-center sm:w-auto sm:shrink-1 sm:snap-align-none",
        "border-zinc-800 bg-zinc-900/20 backdrop-blur-xl hover:bg-zinc-800/40 hover:border-zinc-700",
        state.isPlaying && "border-primary/40 bg-primary/5 shadow-primary-lg ring-1 ring-primary/20"
      )}
    >
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
          <IconComponent className="h-6 w-6" />
        </button>

        {/* Mini Wave Visualizer (only when playing) */}
        {state.isPlaying && (
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
