import React from "react";
import { 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Flame, 
  Trees, 
  Waves, 
  Moon, 
  Sun, 
  Bird, 
  Music, 
  Coffee, 
  Book, 
  Ghost, 
  Heart, 
  Star, 
  Zap, 
  Snowflake, 
  Mountain, 
  Leaf, 
  TrainFront, 
  TrainTrack,
  Palmtree, 
  Volume2, 
  Radio, 
  Mic, 
  Headphones,
  LucideProps
} from "lucide-react";

export const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  CloudRain,
  CloudLightning,
  Wind,
  Flame,
  Trees,
  Waves,
  Moon,
  Sun,
  Bird,
  Music,
  Coffee,
  Book,
  Ghost,
  Heart,
  Star,
  Zap,
  Snowflake,
  Mountain,
  Leaf,
  TrainFront,
  TrainTrack,
  Palmtree,
  Volume2,
  Radio,
  Mic,
  Headphones,
};

interface IconRendererProps extends LucideProps {
  name: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, ...props }) => {
  const Icon = ICON_MAP[name] || Music;
  return <Icon {...props} />;
};
