import initialMaps from "./maps.json";
import initialVehicles from "./vehicles.json";
import initialAmmunition from "./ammunition.json";
import initialNews from "./news.json";
import initialSetups from "./lineups.json";
import initialStatistics from "./statistics.json";
import initialVideos from "./videos.json";

export interface TacticalPoint {
  id: string;
  type: "allied_spawn" | "enemy_spawn" | "cap_point" | "sniper" | "flank" | "ambush" | "danger_zone";
  x: number; // percentage
  y: number; // percentage
  labelUA: string;
  labelEN: string;
  descUA?: string;
  descEN?: string;
}

export interface MapData {
  id: string;
  nameUA: string;
  nameEN: string;
  version: string;
  date: string;
  type: "ground" | "aircraft" | "helicopter" | "coastal_fleet" | "bluewater_fleet";
  descriptionUA: string;
  descriptionEN: string;
  youtubeId: string;
  tacticalPoints: TacticalPoint[];
}

export interface VehicleData {
  id: string;
  name: string;
  type: "ground" | "aircraft" | "helicopter" | "coastal_fleet" | "bluewater_fleet";
  nation: "usa" | "germany" | "ussr" | "great_britain" | "france" | "japan" | "china" | "italy" | "sweden" | "israel";
  classUA: string;
  classEN: string;
  br: number;
  rank?: number;
  winrateAB: number;
  winrateRB: number;
  winrateSB: number;
  descriptionUA: string;
  descriptionEN: string;
  ammoUA: string;
  ammoEN: string;
  abGuideUA: string;
  abGuideEN: string;
  rbGuideUA: string;
  rbGuideEN: string;
  sbGuideUA: string;
  sbGuideEN: string;
  youtubeId?: string;
}

export interface AmmunitionData {
  id: string;
  name: string;
  fullNameUA: string;
  fullNameEN: string;
  caliberUA: string;
  caliberEN: string;
  velocity: number;
  penetration10m: number;
  penetration500m: number;
  penetration2000m: number;
  explosiveMass?: number;
  characteristicsUA: string;
  characteristicsEN: string;
  ammoIcon: "apfsds" | "aphe" | "heat" | "hesh" | "apcr";
  wikiUrl: string;
}

export interface NewsData {
  id: string;
  titleUA: string;
  titleEN: string;
  date: string;
  categoryUA: string;
  categoryEN: string;
  summaryUA: string;
  summaryEN: string;
  contentUA: string;
  contentEN: string;
}

export interface SetupUnit {
  name: string;
  type: string;
  roleUA: string;
  roleEN: string;
}

export interface SetupData {
  id: string;
  nation: "usa" | "germany" | "ussr";
  br: number;
  titleUA: string;
  titleEN: string;
  difficultyUA: string;
  difficultyEN: string;
  descriptionUA: string;
  descriptionEN: string;
  groundUnits: SetupUnit[];
  airUnits: SetupUnit[];
  navalUnits: SetupUnit[];
}

export {
  initialMaps,
  initialVehicles,
  initialAmmunition,
  initialNews,
  initialSetups,
  initialStatistics,
  initialVideos
};
