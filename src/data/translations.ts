import uk from "./uk.json";
import en from "./en.json";
import pl from "./pl.json";
import de from "./de.json";
import fr from "./fr.json";
import es from "./es.json";
import ru from "./ru.json";

export interface TranslationSet {
  title: string;
  subtitle: string;
  navVehicles: string;
  navMaps: string;
  navAmmo: string;
  navSetups: string;
  navNews: string;
  navStats: string;
  searchPlaceholder: string;
  themeLight: string;
  themeDark: string;
  allNations: string;
  allTypes: string;
  ground: string;
  aviation: string;
  fleet: string;
  helicopter: string;
  coastal_fleet: string;
  bluewater_fleet: string;
  guideAB: string;
  guideRB: string;
  guideSB: string;
  winrate: string;
  brLabel: string;
  recommendedAmmo: string;
  wikiSource: string;
  downloadGame: string;
  gajinAccount: string;
  gajinStore: string;
  gajinCareers: string;
  spawnAllied: string;
  spawnEnemy: string;
  capPoint: string;
  sniperZone: string;
  flankZone: string;
  ambushZone: string;
  dangerZone: string;
  selectMap: string;
  filterByBr: string;
  recommendedLineup: string;
  groundForces: string;
  airSupport: string;
  navalEscort: string;
  difficulty: string;
  noDataMessage: string;
  importExportTitle: string;
  importExportDesc: string;
  importPlaceholder: string;
  importBtn: string;
  exportBtn: string;
  resetBtn: string;
  ammoPenetration: string;
  velocity: string;
  explosiveFiller: string;
  caliber: string;
  newsTitle: string;
  customStatsLoaded: string;
  allSections: string;
  youtubeTacticalGuide: string;
  videoGuide: string;
  guideMissingCustom: string;
  mapGlobalDesc: string;
  mapBenefits: string;
  mapBenefit1: string;
  mapBenefit2: string;
  mapBenefit3: string;
  mapThreats: string;
  mapThreat1: string;
  mapThreat2: string;
  mapThreat3: string;
  ammoTableTitle: string;
  ammoTableDesc: string;
  ammoStructure: string;
  explosiveMass: string;
  cumulativeJet: string;
  yes: string;
  no: string;
  kinetic: string;
  readWikiGuide: string;
  lineupSubtitle: string;
  faction: string;
  optimalSetup: string;
  requiredGround: string;
  airSupportCas: string;
  navalSupport: string;
  navalSupportNav: string;
  notFoundTitle: string;
  notFoundDesc: string;
  newsSubtitle: string;
  usefulMaterials: string;
  analytcisModes: string;
  patchNotes: string;
  careersGajin: string;
  forumDiscussions: string;
  joinTheGame: string;
  downloadGameDesc: string;
  downloadFree: string;
  downloadPackage: string;
  vehiclesCount: string;
  mapsCount: string;
  ammoCount: string;
  manualInputTitle: string;
  vehicleNameInput: string;
  combatClass: string;
  brInput: string;
  rankInput: string;
  rankPlaceholder: string;
  recommendedAmmoInput: string;
  addVehicleBtn: string;
  gajinDisclaimer: string;
  showMoreBtn: string;
  foundVehicles: string;
  performanceIndicators: string;
  selectTacticalPoint: string;
  newsTab: string;
  filters: string;
  tacticalMap: string;
  shellComparison: string;
  bestLineups: string;
  dataImport: string;
  combatForces: string;
  allForces: string;
  tanks: string;
  planes: string;
  ships: string;
  helicopterClass: string;
  coastalFleetClass: string;
  bluewaterFleetClass: string;
  deploymentMode: string;
  pointArcadeDesc: string;
  pointRealisticDesc: string;
  pointSimDesc: string;
  metersPerSecond: string;
  copperJet: string;
  importSuccess: string;
  invalidJson: string;
  importError: string;
  databaseReset: string;
  sortByAb: string;
  sortByRb: string;
  sortBySb: string;
  sortByName: string;
  sortByBrDesc: string;
  sortByBrAsc: string;
  sortListLabel: string;
  allBattleRatings: string;
  tacticalMapsTitle: string;
  mapSearchPlaceholder: string;
  yearLabel: string;
  mapVerificationText: string;
  theaterTitle: string;
  filterAll: string;
  filterSpawns: string;
  filterCaps: string;
  filterSnipers: string;
  filterAmbushes: string;
  theaterSpecs: string;
  totalSizeLabel: string;
  gridCellScale: string;
  oneCellEquals: string;
  laserRuler: string;
  set2Coordinates: string;
  heatmapLabel: string;
  flanksLabel: string;
  laserRangefinderLabel: string;
  clearRuler: string;
  zoomReset: string;
  pointDetailsTitle: string;
  sectorLabel: string;
  pointDefaultDesc: string;
  liquipediaIntelligence: string;
  viewArticle: string;
  mapDetailsSize: string;
  mapDetailsLandscape: string;
  mapDetailsComplexity: string;
  liquipediaTacticalAdvice: string;
  remaining: string;
  videoChecking: string;
  videoUnavailable: string;
  videoNotAdded: string;
  videoLazyLoad: string;
  allRanks: string;
  mapProTip: string;
}

export const languages = [
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" }
];

export const translations: Record<string, TranslationSet> = {
  uk: (uk as unknown) as TranslationSet,
  en: (en as unknown) as TranslationSet,
  pl: (pl as unknown) as TranslationSet,
  de: (de as unknown) as TranslationSet,
  fr: (fr as unknown) as TranslationSet,
  es: (es as unknown) as TranslationSet,
  ru: (ru as unknown) as TranslationSet,
};
