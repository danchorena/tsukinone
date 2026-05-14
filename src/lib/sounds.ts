import { Sound } from "@/types";
import rainSrc from "@/assets/rain.mp3";
import stormSrc from "@/assets/storm.aiff";
import whiteNoiseSrc from "@/assets/white-noise.wav";

export const SOUND_LIBRARY: Sound[] = [
  {
    id: "rain",
    name: "Rain",
    icon: "CloudRain",
    src: rainSrc,
  },
  {
    id: "storm",
    name: "Storm",
    icon: "CloudLightning",
    src: stormSrc,
  },
  {
    id: "white-noise",
    name: "White Noise",
    icon: "Wind",
    src: whiteNoiseSrc,
  },
];
