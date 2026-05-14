import { Sound } from "@/types";
import rainSrc from "@/assets/rain.ogg";
import stormSrc from "@/assets/storm.ogg";
import whiteNoiseSrc from "@/assets/white-noise.ogg";
import fireplaceSrc from "@/assets/fireplace.ogg";
import forestSrc from "@/assets/forest.ogg";
import insideTrainSrc from "@/assets/inside_train.ogg";
import streamSrc from "@/assets/stream.ogg";
import trainSrc from "@/assets/train.ogg";
import tropicalForestSrc from "@/assets/tropical_forest.ogg";

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
  {
    id: "fireplace",
    name: "Fireplace",
    icon: "Flame",
    src: fireplaceSrc,
  },
  {
    id: "forest",
    name: "Forest",
    icon: "Trees",
    src: forestSrc,
  },
  {
    id: "inside-train",
    name: "Inside Train",
    icon: "TrainFront",
    src: insideTrainSrc,
  },
  {
    id: "stream",
    name: "Stream",
    icon: "Waves",
    src: streamSrc,
  },
  {
    id: "train",
    name: "Train",
    icon: "TrainTrack",
    src: trainSrc,
  },
  {
    id: "tropical-forest",
    name: "Tropical Forest",
    icon: "Palmtree",
    src: tropicalForestSrc,
  },
];
