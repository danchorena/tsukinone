import React, { useState } from "react";
import { Plus } from "lucide-react";
import { IconRenderer, ICON_MAP } from "@/components/IconRenderer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAudio } from "@/context/AudioContext";
import { open } from "@tauri-apps/plugin-dialog";

const ATMOSPHERIC_ICONS = [
  "CloudRain", "CloudLightning", "Wind", "Flame", "Trees", "Waves", 
  "Moon", "Sun", "Bird", "Music", "Coffee", "Book", "Ghost", "Heart", 
  "Star", "Zap", "Snowflake", "Mountain", "Leaf", "TrainFront", "TrainTrack",
  "Palmtree", "Volume2", "Radio", "Mic", "Headphones"
];

export const AddSoundTile: React.FC = () => {
  const { registerSound } = useAudio();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Music");
  const [filePath, setFilePath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Audio',
          extensions: ['mp3', 'ogg', 'wav', 'aac', 'm4a']
        }]
      });
      if (selected && typeof selected === 'string') {
        setFilePath(selected);
        if (!name) {
          // Set name from filename if not already set
          const filename = selected.split(/[/\\]/).pop() || "";
          setName(filename.replace(/\.[^/.]+$/, ""));
        }
      }
    } catch (error) {
      console.error("Failed to pick file:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !filePath) return;

    setIsSubmitting(true);
    try {
      await registerSound(name, icon, filePath);
      setIsOpen(false);
      // Reset form
      setName("");
      setIcon("Music");
      setFilePath("");
    } catch (error) {
      console.error("Failed to register sound:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card
          className={cn(
            "group relative flex flex-col items-center justify-center p-6 cursor-pointer border-dashed transition-all duration-500",
            "max-sm:w-[75vw] max-sm:shrink-0 max-sm:snap-center sm:w-auto sm:shrink-1 sm:snap-align-none",
            "border-zinc-800 bg-zinc-900/10 hover:bg-zinc-800/30 hover:border-zinc-700 h-[220px]"
          )}
        >
          <div className="rounded-full bg-zinc-800/30 p-4 text-zinc-500 group-hover:bg-zinc-800/60 group-hover:text-zinc-200 transition-all duration-500 mb-4">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-500 group-hover:text-zinc-300 transition-colors duration-500">
            Add Sound
          </span>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-[#050505]/95 backdrop-blur-2xl border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Add Custom Sound</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="file" className="text-zinc-400">Audio File</Label>
            <div className="flex gap-2">
              <Input 
                id="file" 
                readOnly 
                placeholder="Choose audio file..." 
                value={filePath ? filePath.split(/[/\\]/).pop() : ""} 
                className="bg-zinc-900 border-zinc-800"
              />
              <Button type="button" variant="secondary" onClick={handlePickFile} className="shrink-0">
                Browse
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-400">Sound Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Rainy Cafe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400">Select Icon</Label>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1 no-scrollbar border border-zinc-900 rounded-lg">
              {ATMOSPHERIC_ICONS.map((iconName) => {
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      "flex items-center justify-center h-10 w-10 rounded-md transition-all",
                      icon === iconName 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                    )}
                  >
                    <IconRenderer name={iconName} className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              disabled={!name || !filePath || isSubmitting}
            >
              {isSubmitting ? "Importing..." : "Add to Library"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
