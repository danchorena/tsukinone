import { useRef, useState } from "react";
import { SoundTile } from "@/components/SoundTile";
import { SOUND_LIBRARY } from "@/lib/sounds";
import { useAudio } from "@/context/AudioContext";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Square, Settings, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function App() {
  const { stopAll, states, isMasterMuted, toggleMasterMute, masterVolume, setMasterVolume } = useAudio();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      <header className="relative z-50 border-b border-zinc-900 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Settings className="h-4 w-4 animate-spin-slow" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Tsukinone</h1>
          </div>

          {/* Desktop Search (Hidden on Mobile) */}
          <div className="hidden flex-1 max-w-md mx-8 sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input 
                placeholder="Search sounds..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-primary/50"
              />
            </div>
          </div>

          {/* Desktop Controls (sm and up) */}
          <div className="hidden items-center gap-3 sm:flex">
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

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out sm:hidden bg-zinc-950/90 border-t border-zinc-900",
          isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="flex flex-col gap-4 p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input 
                placeholder="Search sounds..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-800"
              />
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleMasterMute}
                  className={cn(
                    "h-8 w-8 p-0",
                    isMasterMuted ? "text-primary bg-primary/10" : "text-zinc-400"
                  )}
                >
                  {isMasterMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[masterVolume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(vals) => setMasterVolume(vals[0] / 100)}
                  className="flex-1"
                />
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={stopAll}
                className="text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <Square className="mr-2 h-4 w-4" />
                <span>Stop All</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="relative flex-1 overflow-hidden group/content">
        {/* Carousel Navigation Buttons */}
        <button 
          onClick={() => scroll("left")}
          className={cn(
            "absolute left-4 top-1/2 z-40 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white backdrop-blur-md transition-all duration-300",
            "sm:opacity-0 sm:group-hover/content:opacity-100 sm:hidden flex items-center justify-center"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={() => scroll("right")}
          className={cn(
            "absolute right-4 top-1/2 z-40 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white backdrop-blur-md transition-all duration-300",
            "sm:opacity-0 sm:group-hover/content:opacity-100 sm:hidden flex items-center justify-center"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Edge Fading Masks (Premium Gradient) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-[#050505] to-transparent sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-[#050505] to-transparent sm:hidden" />

        <div className="h-full w-full overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth">
          <div className="mx-auto w-full max-w-screen-2xl px-6 pt-14 pb-20 sm:px-10">
            {filteredSounds.length > 0 ? (
              <div 
                ref={scrollRef}
                className={cn(
                  "mx-auto w-full",
                  // Mobile Carousel (Default)
                  "flex flex-nowrap overflow-x-auto snap-x snap-mandatory pb-8 pt-4 px-[5vw] no-scrollbar",
                  // Grid System (Tablet/Desktop)
                  "sm:grid sm:flex-none sm:overflow-visible sm:snap-none sm:px-0 sm:pt-0 sm:pb-0",
                  "sm:grid-cols-2 sm:gap-8",
                  "md:grid-cols-3",
                  "lg:grid-cols-4",
                  "xl:grid-cols-6",
                  "gap-6"
                )}
              >
                {filteredSounds.map((sound) => (
                  <SoundTile key={sound.id} sound={sound} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-700 animate-in fade-in duration-700">
                <Search className="h-16 w-16 mb-6 opacity-10" />
                <p className="text-base font-medium tracking-wide">No sounds match your focus</p>
              </div>
            )}
            
            {/* Visual Cue for Carousel */}
            {filteredSounds.length > 0 && (
              <div className="mt-8 flex justify-center gap-3 sm:hidden">
                {filteredSounds.map((sound) => (
                  <div 
                    key={`dot-${sound.id}`}
                    className={cn(
                      "h-1.5 transition-all duration-500 rounded-full",
                      states[sound.id]?.isPlaying ? "w-8 bg-primary" : "w-1.5 bg-zinc-800"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
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
