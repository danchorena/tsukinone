import { useRef, useState } from "react";
import { SoundTile } from "@/components/SoundTile";
import { SOUND_LIBRARY } from "@/lib/sounds";
import { useAudio } from "@/context/AudioContext";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Square, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function App() {
  const { stopAll, states, isMasterMuted, toggleMasterMute, masterVolume, setMasterVolume } = useAudio();
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredSounds = SOUND_LIBRARY.filter(sound => 
    sound.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <main className="flex h-screen flex-col bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-zinc-900 px-6 py-4 backdrop-blur-xl bg-black/20 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Settings className="h-4 w-4 animate-spin-slow" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Tsukinone</h1>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleMasterMute}
              className={cn(
                "h-8 w-8 p-0 transition-colors",
                isMasterMuted ? "text-primary bg-primary/10" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              {isMasterMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={stopAll}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input 
              placeholder="Search sounds..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-primary/50"
            />
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMasterMute}
                className={cn(
                  "h-8 w-8 p-0 transition-colors",
                  isMasterMuted ? "text-primary bg-primary/10" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                )}
              >
                {isMasterMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <div className="w-16 lg:w-24">
                <Slider
                  value={[masterVolume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(vals) => setMasterVolume(vals[0] / 100)}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={stopAll}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900 whitespace-nowrap"
            >
              <Square className="mr-2 h-4 w-4" />
              <span>Stop All</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="relative flex-1 overflow-hidden">
        {/* Carousel Navigation Buttons (only visible on extremely small screens) */}
        <button 
          onClick={() => scroll("left")}
          className="absolute left-1 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-md transition-opacity hover:bg-black/60 xs:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button 
          onClick={() => scroll("right")}
          className="absolute right-1 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-md transition-opacity hover:bg-black/60 xs:hidden"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Edge Fading Mask */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-[#050505] to-transparent xs:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-[#050505] to-transparent xs:hidden" />

        <div className={cn(
          "h-full w-full overflow-y-auto overflow-x-hidden p-6 sm:p-8 no-scrollbar",
          "flex flex-col items-center"
        )}>
          {filteredSounds.length > 0 ? (
            <div 
              ref={scrollRef}
              className={cn(
                "mx-auto w-full transition-all duration-500",
                // Grid System
                "grid grid-cols-1 gap-6",
                "sm:grid-cols-2",
                "md:grid-cols-3",
                "lg:grid-cols-4",
                "xl:grid-cols-6",
                // Mobile Carousel Logic (only on xs screens)
                "max-xs:flex max-xs:overflow-x-auto max-xs:snap-x max-xs:snap-mandatory max-xs:pb-12 max-xs:px-[10vw]"
              )}
            >
              {filteredSounds.map((sound) => (
                <SoundTile key={sound.id} sound={sound} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600">
              <Search className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No sounds found</p>
            </div>
          )}
          
          {/* Visual Cue for Carousel (xs only) */}
          {filteredSounds.length > 0 && (
            <div className="mt-4 flex justify-center gap-2 xs:hidden">
              {filteredSounds.map((sound) => (
                <div 
                  key={`dot-${sound.id}`}
                  className={cn(
                    "h-1 transition-all duration-300 rounded-full",
                    states[sound.id]?.isPlaying ? "w-6 bg-primary" : "w-1.5 bg-zinc-800"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer / Status */}
      <footer className="border-t border-zinc-900 px-6 py-3 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
        Tsukinone — Handcrafted for Deep Focus
      </footer>
    </main>
  );
}

export default App;
