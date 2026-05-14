export interface Sound {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  src: string;
}

export interface SoundState {
  isPlaying: boolean;
  volume: number;
}
