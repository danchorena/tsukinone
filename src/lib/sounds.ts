import { Sound } from "@/types";
import rainSrc from "@/assets/rain.ogg";
import stormSrc from "@/assets/storm.ogg";
import whiteNoiseSrc from "@/assets/white-noise.ogg";

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
