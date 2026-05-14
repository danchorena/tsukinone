import React, { useRef } from "react";
import { SoundTile } from "@/components/SoundTile";
import { SOUND_LIBRARY } from "@/lib/sounds";
import { useAudio } from "@/context/AudioContext";
import { Button } from "@/components/ui/button";
import { VolumeX, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function App() {
  const { stopAll, states } = useAudio();
  const scrollRef = useRef<HTMLDivElement>(null);

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
      <header className="flex items-center justify-between border-b border-zinc-900 px-6 py-4 backdrop-blur-xl bg-black/20">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Settings className="h-4 w-4 animate-spin-slow" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">SonicBackground</h1>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={stopAll}
          className="text-zinc-400 hover:text-white hover:bg-zinc-900"
        >
          <VolumeX className="mr-2 h-4 w-4" />
          Stop All
        </Button>
      </header>

      {/* Main Content Area */}
      <section className="relative flex-1 overflow-hidden">
        {/* Carousel Navigation Buttons (only visible on mobile/mini) */}
        <button 
          onClick={() => scroll("left")}
          className="absolute left-1 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-md transition-opacity hover:bg-black/60 sm:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button 
          onClick={() => scroll("right")}
          className="absolute right-1 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-md transition-opacity hover:bg-black/60 sm:hidden"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Edge Fading Mask (reduced size to prevent hitbox overlap) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-[#050505] to-transparent sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-[#050505] to-transparent sm:hidden" />

        <div className={cn(
          "h-full w-full overflow-y-auto overflow-x-hidden p-6 sm:p-8 no-scrollbar",
          "flex flex-col items-center"
        )}>
          <div 
            ref={scrollRef}
            className={cn(
              "mx-auto w-full transition-all duration-500",
              // Desktop: Grid
              "sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6",
              // Mobile: Horizontal Carousel (No justify-center to avoid hit-test bugs)
              "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 no-scrollbar px-[10vw]"
            )}
          >
            {SOUND_LIBRARY.map((sound) => (
              <SoundTile key={sound.id} sound={sound} />
            ))}
          </div>
          
          {/* Visual Cue for Carousel */}
          <div className="mt-4 flex justify-center gap-2 sm:hidden">
            {SOUND_LIBRARY.map((sound) => (
              <div 
                key={`dot-${sound.id}`}
                className={cn(
                  "h-1 transition-all duration-300 rounded-full",
                  states[sound.id].isPlaying ? "w-6 bg-primary" : "w-1.5 bg-zinc-800"
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Status */}
      <footer className="border-t border-zinc-900 px-6 py-3 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
        Handcrafted for Deep Focus
      </footer>
    </main>
  );
}

export default App;
