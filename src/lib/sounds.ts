import { Sound } from "@/types";
import rainSrc from "@/assets/rain.ogg";
import lightRainSrc from "@/assets/light_rain.ogg";
import stormSrc from "@/assets/storm.ogg";
import stormAndRainSrc from "@/assets/storm_and_rain.ogg";
import whiteNoiseSrc from "@/assets/white-noise.ogg";
import fireplaceSrc from "@/assets/fireplace.ogg";
import forestSrc from "@/assets/forest.ogg";
import streamAndBirdsSrc from "@/assets/stream_and_birds.ogg";
import insideTrainSrc from "@/assets/inside_train.ogg";
import streamSrc from "@/assets/stream.ogg";
import trainSrc from "@/assets/train.ogg";
import tropicalForestSrc from "@/assets/tropical_forest.ogg";
import windUndergroundSrc from "@/assets/wind_underground.ogg";
import windyLakeSrc from "@/assets/windy_lake.ogg";

export const SOUND_LIBRARY: Sound[] = [
  {
    id: "rain",
    name: "Rain",
    icon: "CloudRain",
    src: rainSrc,
  },
  {
    id: "light-rain",
    name: "Light Rain",
    icon: "CloudRain",
    src: lightRainSrc,
  },
  {
    id: "storm",
    name: "Storm",
    icon: "CloudLightning",
    src: stormSrc,
  },
  {
    id: "storm-rain",
    name: "Storm & Rain",
    icon: "CloudLightning",
    src: stormAndRainSrc,
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
    id: "stream-birds",
    name: "Stream & Birds",
    icon: "Trees",
    src: streamAndBirdsSrc,
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
  {
    id: "wind-underground",
    name: "Wind Underground",
    icon: "Wind",
    src: windUndergroundSrc,
  },
  {
    id: "windy-lake",
    name: "Windy Lake",
    icon: "Waves",
    src: windyLakeSrc,
  },
];
