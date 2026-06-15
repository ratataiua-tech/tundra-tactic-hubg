import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Compass, 
  Shield, 
  Activity, 
  Eye, 
  Skull, 
  Download, 
  Globe, 
  Sun, 
  Moon, 
  Upload, 
  Database, 
  BookOpen, 
  Search, 
  Filter, 
  Target, 
  AlertTriangle, 
  ExternalLink, 
  ChevronRight, 
  Flame, 
  Anchor, 
  Plane, 
  ShieldAlert, 
  Settings, 
  ChevronDown, 
  TrendingUp, 
  RefreshCw, 
  Volume2, 
  Play, 
  Crosshair,
  MapPin,
  Trophy,
  Award,
  Trash2,
  List,
  Plus,
  Video,
  ZoomIn
} from "lucide-react";
import { 
  initialMaps, 
  initialVehicles, 
  initialAmmunition, 
  initialNews, 
  initialSetups, 
  initialVideos,
  MapData, 
  VehicleData, 
  AmmunitionData, 
  NewsData, 
  SetupData, 
  TacticalPoint 
} from "./data/db";
import { useTranslation } from "react-i18next";
import { YoutubePlayer } from "./components/YoutubePlayer";
import { cacheDb } from "./lib/indexedDB";
import { translations, languages, TranslationSet } from "./data/translations";
import { WAR_THUNDER_MAPS_SPECS, calculateRealDistance } from "./data/mapSpecs";

// Import custom dynamic databases & galleries
import mapsImages from "./data/maps_images.json";
import vehiclesImages from "./data/vehicles_images.json";
import ammunitionImages from "./data/ammunition_images.json";

// Map IDs to their corresponding local WEBP filenames
export const LOCAL_MAP_WEBP_MAPPING: Record<string, string> = {
  kuban: "Kuban - Krymsk.webp",
  kursk: "Kursk - Red October.webp",
  mozdok: "Mozdok - Bratskoe.webp",
  hurtgen: "Hurtgen Forest - Vossenack.webp",
  berlin: "Berlin - Konigsplatz.webp",
  normandy: "Normandy - Omaha Beach.webp",
  finland: "Finland - Yasnoe Lake.webp",
  rhine: "Advance to the Rhine - Cologne.webp",
  stalingrad: "Stalingrad - Tractor Factory.webp",
  elalamein: "Second Battle of El Alamein.webp",
  tunis: "Tunisia - Akarit.webp",
  volokolamsk: "Volokolamsk - Nelidovo.webp",
  novorossiysk: "Port Novorossiysk.webp",
  sinai: "Sinai - Suez Canal.webp",
  abandoned_factory: "Abandoned Factory.webp",
  ardennes: "Ardennes - Bastogne.webp",
  fulda: "Fulda Gap - Point Alpha.webp",
  maginot: "Maginot Line - Sedan.webp",
  italy: "Italy - Campania.webp",
  breslau: "Breslau - Wroclaw.webp",
  abandoned_city: "Abandoned City - Tkvarchreli.webp"
};

// Import modular gallery and walkthrough components
import { VehicleImageGallery } from "./components/VehicleImageGallery";
import { VehicleVideoWalkthrough } from "./components/VehicleVideoWalkthrough";
import { MapVideoWalkthrough } from "./components/MapVideoWalkthrough";
import { ImageZoomModal } from "./components/ImageZoomModal";
import { MapCorrespondenceTable } from "./components/MapCorrespondenceTable";

export const NATIONS_MAP: Record<string, { flag: string; nameUA: string; nameEN: string }> = {
  usa: { flag: "🇺🇸", nameUA: "USA (США)", nameEN: "USA" },
  germany: { flag: "🇩🇪", nameUA: "Germany (Німеччина)", nameEN: "Germany" },
  ussr: { flag: "🇷🇺", nameUA: "USSR (СРСР)", nameEN: "USSR" },
  great_britain: { flag: "🇬🇧", nameUA: "Great Britain (Велика Британія)", nameEN: "Great Britain" },
  japan: { flag: "🇯🇵", nameUA: "Japan (Японія)", nameEN: "Japan" },
  china: { flag: "🇨🇳", nameUA: "China (Китай)", nameEN: "China" },
  italy: { flag: "🇮🇹", nameUA: "Italy (Італія)", nameEN: "Italy" },
  france: { flag: "🇫🇷", nameUA: "France (Франція)", nameEN: "France" },
  sweden: { flag: "🇸🇪", nameUA: "Sweden (Швеція)", nameEN: "Sweden" },
  israel: { flag: "🇮🇱", nameUA: "Israel (Ізраїль)", nameEN: "Israel" }
};

export default function App() {
  const { i18n } = useTranslation();

  // Locale state
  const [lang, setLang] = useState<string>(() => {
    return localStorage.getItem("wt_tactical_lang") || "uk";
  });

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("wt_tactical_theme") !== "light";
  });

  // Current tab state
  const [activeTab, setActiveTab] = useState<"vehicles" | "maps" | "ammo" | "setups" | "news" | "stats">("vehicles");

  // Databases in state for dynamic updates (import/export/custom additions) To Scalability rule
  const [vehicles, setVehicles] = useState<VehicleData[]>(() => {
    const cached = localStorage.getItem("wt_vehicles_db");
    return cached ? JSON.parse(cached) : initialVehicles;
  });

  const [maps, setMaps] = useState<MapData[]>(() => {
    const cached = localStorage.getItem("wt_maps_db");
    return cached ? JSON.parse(cached) : initialMaps;
  });

  const [ammunition, setAmmunition] = useState<AmmunitionData[]>(() => {
    const cached = localStorage.getItem("wt_ammo_db");
    return cached ? JSON.parse(cached) : initialAmmunition;
  });

  const [news, setNews] = useState<NewsData[]>(() => {
    const cached = localStorage.getItem("wt_news_db");
    return cached ? JSON.parse(cached) : initialNews;
  });

  const [setups, setSetups] = useState<SetupData[]>(() => {
    const cached = localStorage.getItem("wt_setups_db");
    return cached ? JSON.parse(cached) : initialSetups;
  });

  // Zoom state for Ammo Images
  const [zoomedAmmoImage, setZoomedAmmoImage] = useState<{ url: string; name: string } | null>(null);

  // Videos state representing the dynamic video guides list
  const [videos, setVideos] = useState<any[]>(() => {
    const cached = localStorage.getItem("wt_videos_db");
    return cached ? JSON.parse(cached) : initialVideos;
  });

  // Dynamic image registries
  const [vehiclesImagesState, setVehiclesImagesState] = useState<Record<string, string[]>>(() => {
    const cached = localStorage.getItem("wt_vehicles_images_db");
    return cached ? JSON.parse(cached) : vehiclesImages;
  });

  const [mapsImagesState, setMapsImagesState] = useState<Record<string, string[]>>(() => {
    const cached = localStorage.getItem("wt_maps_images_db");
    return cached ? JSON.parse(cached) : mapsImages;
  });

  // Keep images in localStorage
  useEffect(() => {
    localStorage.setItem("wt_vehicles_images_db", JSON.stringify(vehiclesImagesState));
  }, [vehiclesImagesState]);

  useEffect(() => {
    localStorage.setItem("wt_maps_images_db", JSON.stringify(mapsImagesState));
  }, [mapsImagesState]);

  // Admin lock/verification and sub-tabs
  const [adminPassVerified, setAdminPassVerified] = useState<boolean>(() => {
    return localStorage.getItem("wt_admin_verified") === "true";
  });
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");
  const [adminSubTab, setAdminSubTab] = useState<"import" | "vehicles" | "maps" | "videos">("import");

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const sec = String(60 - d.getSeconds()).padStart(2, "0");
      setCurrentTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')} (осталось ${sec}с)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Time-based and Static Auth token generator
  const getAdminOTPs = () => {
    const d = new Date();
    const getForDate = (dateObj: Date) => {
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const codeDay = `${yyyy}${mm}${dd}`; // e.g. 20260614
      
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const mins = String(dateObj.getMinutes()).padStart(2, "0");
      const rawNum = parseInt(`${dd}${mm}${hours}${mins}`, 10);
      const codeTime = String((rawNum * 7) % 90000000 + 10000000); // 8-digit OTP
      
      return [codeDay, codeTime];
    };

    const prevD = new Date(d.getTime() - 60000); // 1 minute ago for time drift protection
    
    return [
      ...getForDate(d),
      ...getForDate(prevD),
      "11092001"
    ];
  };

  // Helper for reading local files into Base64
  const handleLocalImagesChange = (e: React.ChangeEvent<HTMLInputElement>, isMap: boolean) => {
    const files = e.target.files;
    if (!files) return;
    
    const promises = (Array.from(files) as File[]).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((base64s) => {
      if (isMap) {
        setManualMap(prev => ({ ...prev, localImages: [...prev.localImages, ...base64s] }));
      } else {
        setVehicleFormState(prev => ({ ...prev, localImages: [...prev.localImages, ...base64s] }));
      }
    });
  };

  // Vehicle form state
  const [vehicleFormState, setVehicleFormState] = useState({
    name: "",
    nation: "usa",
    type: "ground",
    classUA: "ОБТ",
    classEN: "MBT",
    br: 11.7,
    rank: 8,
    winrateAB: 50.0,
    winrateRB: 50.0,
    winrateSB: 50.0,
    descriptionUA: "",
    descriptionEN: "",
    ammoUA: "",
    ammoEN: "",
    abGuideUA: "",
    abGuideEN: "",
    rbGuideUA: "",
    rbGuideEN: "",
    sbGuideUA: "",
    sbGuideEN: "",
    imageUrlsString: "",
    localImages: [] as string[],
    youtubeUrlsString: ""
  });

  // Map form state
  const [manualMap, setManualMap] = useState({
    nameUA: "",
    nameEN: "",
    version: "1.0",
    date: "2026",
    type: "ground",
    descriptionUA: "",
    descriptionEN: "",
    imageUrlsString: "",
    localImages: [] as string[],
    youtubeUrlsString: ""
  });

  // Async IndexedDB caching load on mount
  useEffect(() => {
    const fetchIndexedDBCache = async () => {
      const cachedVehicles = await cacheDb.get("wt_vehicles_db");
      if (cachedVehicles) setVehicles(cachedVehicles);

      const cachedMaps = await cacheDb.get("wt_maps_db");
      if (cachedMaps) setMaps(cachedMaps);

      const cachedAmmo = await cacheDb.get("wt_ammo_db");
      if (cachedAmmo) setAmmunition(cachedAmmo);

      const cachedNews = await cacheDb.get("wt_news_db");
      if (cachedNews) setNews(cachedNews);

      const cachedSetups = await cacheDb.get("wt_setups_db");
      if (cachedSetups) setSetups(cachedSetups);

      const cachedVideos = await cacheDb.get("wt_videos_db");
      if (cachedVideos) setVideos(cachedVideos);
    };
    fetchIndexedDBCache();
  }, []);

  // Sync state modifications to both localStorage and our modern asynchronous IndexedDB cache
  useEffect(() => {
    localStorage.setItem("wt_vehicles_db", JSON.stringify(vehicles));
    cacheDb.set("wt_vehicles_db", vehicles);
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem("wt_maps_db", JSON.stringify(maps));
    cacheDb.set("wt_maps_db", maps);
  }, [maps]);

  useEffect(() => {
    localStorage.setItem("wt_ammo_db", JSON.stringify(ammunition));
    cacheDb.set("wt_ammo_db", ammunition);
  }, [ammunition]);

  useEffect(() => {
    localStorage.setItem("wt_news_db", JSON.stringify(news));
    cacheDb.set("wt_news_db", news);
  }, [news]);

  useEffect(() => {
    localStorage.setItem("wt_setups_db", JSON.stringify(setups));
    cacheDb.set("wt_setups_db", setups);
  }, [setups]);

  // Sync videos state adjustments to cache
  useEffect(() => {
    localStorage.setItem("wt_videos_db", JSON.stringify(videos));
    cacheDb.set("wt_videos_db", videos);
  }, [videos]);

  // Persists lang and theme
  useEffect(() => {
    localStorage.setItem("wt_tactical_lang", lang);
    i18n.changeLanguage(lang);
    document.title = "Tundra Tactic Hub";
  }, [lang, i18n]);

  useEffect(() => {
    localStorage.setItem("wt_tactical_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Translation bundle getter
  const t: TranslationSet = useMemo(() => {
    const currentLang = i18n.language || lang;
    return translations[currentLang] || translations.uk;
  }, [lang, i18n.language]);

  // --- Vehicles Tab Filtering States ---
  const [vehicleSearch, setVehicleSearch] = useState<string>("");
  const [selectedNation, setSelectedNation] = useState<string>("all");
  const [selectedForce, setSelectedForce] = useState<string>("all");
  const [brFilter, setBrFilter] = useState<number | "all">("all");
  const [rankFilter, setRankFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<string>("br_desc");
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Reset pagination on filter or sort criteria change
  useEffect(() => {
    setVisibleCount(8);
  }, [vehicleSearch, selectedNation, selectedForce, brFilter, rankFilter, sortBy]);

  // --- Maps Tab States ---
  const [selectedMapId, setSelectedMapId] = useState<string>("kuban");
  const [mapSearch, setMapSearch] = useState<string>("");
  const [mapPointFilter, setMapPointFilter] = useState<string>("all");
  const [selectedPoint, setSelectedPoint] = useState<TacticalPoint | null>(null);
  const [gridRows, setGridRows] = useState<number>(10);

  // Ruler measurement tool state
  const [rulerActive, setRulerActive] = useState<boolean>(false);
  const [rulerStart, setRulerStart] = useState<{ x: number; y: number } | null>(null);
  const [rulerEnd, setRulerEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Tactical overlay toggles
  const [heatmapActive, setHeatmapActive] = useState<boolean>(true);
  const [routesActive, setRoutesActive] = useState<boolean>(true);

  // Zoom and pan navigation states
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [mapPan, setMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapCanvasRef = useRef<HTMLDivElement>(null);

  // Automatically update grid row layout and reset zoom/pan on map change
  useEffect(() => {
    const mapsWith9Rows = ["mozdok", "rhine", "abandoned_factory"];
    if (mapsWith9Rows.includes(selectedMapId)) {
      setGridRows(9);
    } else {
      setGridRows(10);
    }
    // Clear ruler points when map changes
    setRulerStart(null);
    setRulerEnd(null);
    // Reset zoom and pan
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
  }, [selectedMapId]);

  // Handle non-passive wheel events and mobile gestures for pinch-to-zoom
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;

    // Mouse wheel zoom
    const handleRawWheel = (e: WheelEvent) => {
      // Zoom on wheel inside map, prevents page scroll
      e.preventDefault();
      const zoomFactor = 0.15;
      setMapZoom((prev) => {
        const nextZoom = e.deltaY < 0 ? prev + zoomFactor : prev - zoomFactor;
        return Math.max(1, Math.min(5, nextZoom));
      });
    };

    // Pinch-to-zoom mobile gesture variables
    let touchStartDist = 0;
    const getTouchDist = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStartRaw = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        touchStartDist = getTouchDist(e.touches);
      }
    };

    const handleTouchMoveRaw = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        e.preventDefault();
        const currentDist = getTouchDist(e.touches);
        if (currentDist > 0) {
          const ratio = currentDist / touchStartDist;
          setMapZoom((prev) => {
            const delta = (ratio - 1) * 0.08;
            return Math.max(1, Math.min(5, prev + delta));
          });
        }
      }
    };

    canvas.addEventListener("wheel", handleRawWheel, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStartRaw, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMoveRaw, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleRawWheel);
      canvas.removeEventListener("touchstart", handleTouchStartRaw);
      canvas.removeEventListener("touchmove", handleTouchMoveRaw);
    };
  }, []);

  const getPointCoordinate = (pt: { x: number; y: number }, numRows: number, numCols: number = 10) => {
    const colNum = Math.min(numCols, Math.max(1, Math.floor(pt.x / (100 / numCols)) + 1));
    const rowIdx = Math.min(numRows - 1, Math.max(0, Math.floor(pt.y / (100 / numRows))));
    const rowLetter = String.fromCharCode(65 + rowIdx);
    return `${rowLetter}${colNum}`;
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || rulerActive) return;
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapPan.x, y: e.clientY - mapPan.y });
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    let newPanX = e.clientX - dragStart.x;
    let newPanY = e.clientY - dragStart.y;
    
    if (mapZoom === 1) {
      newPanX = 0;
      newPanY = 0;
    } else {
      const maxPan = (mapZoom - 1) * 150;
      newPanX = Math.max(-maxPan, Math.min(maxPan, newPanX));
      newPanY = Math.max(-maxPan, Math.min(maxPan, newPanY));
    }
    setMapPan({ x: newPanX, y: newPanY });
  };

  const handleMapMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleMapTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !rulerActive) {
      if ((e.target as HTMLElement).closest("button")) return;
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - mapPan.x, y: touch.clientY - mapPan.y });
    }
  };

  const handleMapTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      let newPanX = touch.clientX - dragStart.x;
      let newPanY = touch.clientY - dragStart.y;
      
      if (mapZoom === 1) {
        newPanX = 0;
        newPanY = 0;
      } else {
        const maxPan = (mapZoom - 1) * 150;
        newPanX = Math.max(-maxPan, Math.min(maxPan, newPanX));
        newPanY = Math.max(-maxPan, Math.min(maxPan, newPanY));
      }
      setMapPan({ x: newPanX, y: newPanY });
    }
  };

  const handleMapTouchEnd = () => {
    setIsDragging(false);
  };

  // --- Setups Tab States ---
  const [setupBrFilter, setSetupBrFilter] = useState<number>(5.7);
  const [setupNationFilter, setSetupNationFilter] = useState<"usa" | "germany" | "ussr">("usa");

  // --- Stats Import State ---
  const [jsonInput, setJsonInput] = useState<string>("");
  const [importMessage, setImportMessage] = useState<{ text: string; error: boolean } | null>(null);

  // --- Form addition states for manual inputs ---
  const [manualVehicle, setManualVehicle] = useState({
    name: "",
    nation: "usa",
    type: "ground",
    classUA: "ОБТ",
    classEN: "MBT",
    br: 11.7,
    rank: 8,
    winrateAB: 50.0,
    winrateRB: 50.0,
    winrateSB: 50.0,
    descriptionUA: "",
    descriptionEN: "",
    ammoUA: "",
    ammoEN: "",
    abGuideUA: "",
    abGuideEN: "",
    rbGuideUA: "",
    rbGuideEN: "",
    sbGuideUA: "",
    sbGuideEN: ""
  });

  const handleAddManualVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualVehicle.name) return;
    const newId = "custom_" + Date.now();
    const formatted: VehicleData = {
      id: newId,
      name: manualVehicle.name,
      nation: manualVehicle.nation as any,
      type: manualVehicle.type as any,
      classUA: manualVehicle.classUA,
      classEN: manualVehicle.classEN,
      br: Number(manualVehicle.br),
      rank: Number(manualVehicle.rank),
      winrateAB: Number(manualVehicle.winrateAB),
      winrateRB: Number(manualVehicle.winrateRB),
      winrateSB: Number(manualVehicle.winrateSB),
      descriptionUA: manualVehicle.descriptionUA || manualVehicle.name,
      descriptionEN: manualVehicle.descriptionEN || manualVehicle.name,
      ammoUA: manualVehicle.ammoUA || "Стандартні",
      ammoEN: manualVehicle.ammoEN || "Standard",
      abGuideUA: manualVehicle.abGuideUA || "Атакуйте ворогів",
      abGuideEN: manualVehicle.abGuideEN || "Engage hostiles",
      rbGuideUA: manualVehicle.rbGuideUA || "Займайте висоти",
      rbGuideEN: manualVehicle.rbGuideEN || "Secure heights",
      sbGuideUA: manualVehicle.sbGuideUA || "Уважно оглядайте",
      sbGuideEN: manualVehicle.sbGuideEN || "Scout carefully"
    };

    setVehicles(prev => [formatted, ...prev]);
    setVehicleSearch(manualVehicle.name);
    setManualVehicle({
      name: "",
      nation: "usa",
      type: "ground",
      classUA: "ОБТ",
      classEN: "MBT",
      br: 11.7,
      rank: 8,
      winrateAB: 50.0,
      winrateRB: 50.0,
      winrateSB: 50.0,
      descriptionUA: "",
      descriptionEN: "",
      ammoUA: "",
      ammoEN: "",
      abGuideUA: "",
      abGuideEN: "",
      rbGuideUA: "",
      rbGuideEN: "",
      sbGuideUA: "",
      sbGuideEN: ""
    });
    setImportMessage({ text: t.importSuccess, error: false });
  };

  // --- Rich Media manual additions handlers ---
  const handleAddCustomVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleFormState.name.trim()) return;
    const newId = "custom_vehicle_" + Date.now();

    // Combine external URLs and local base64 files
    const externalUrls = vehicleFormState.imageUrlsString
      .split(",")
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    const combinedImages = [...vehicleFormState.localImages, ...externalUrls];

    // Save paths/images to dynamic JSON vehicleImageState structure!
    if (combinedImages.length > 0) {
      setVehiclesImagesState(prev => ({
        ...prev,
        [newId]: combinedImages
      }));
    }

    // Parse and process videos
    const parsedVideos = vehicleFormState.youtubeUrlsString
      .split(",")
      .map(url => extractYoutubeId(url))
      .filter((id): id is string => id !== null);

    // Add parsed videos to the global videos state collection matching the vehicle
    if (parsedVideos.length > 0) {
      const newVideosList = parsedVideos.map((yId, idx) => ({
        id: `vid_custom_vehicle_${newId}_${idx}_${Date.now()}`,
        targetId: newId,
        category: "vehicles",
        titleUA: `${vehicleFormState.name} - Тактичний відеогайд #${idx + 1}`,
        titleEN: `${vehicleFormState.name} - Tactical Walkthrough Guide #${idx + 1}`,
        youtubeId: yId
      }));
      setVideos(prev => [...newVideosList, ...prev]);
    }

    // Create formatted vehicle object
    const formatted: VehicleData = {
      id: newId,
      name: vehicleFormState.name,
      nation: vehicleFormState.nation as any,
      type: vehicleFormState.type as any,
      classUA: vehicleFormState.classUA || "ОБТ",
      classEN: vehicleFormState.classEN || "MBT",
      br: Number(vehicleFormState.br),
      rank: Number(vehicleFormState.rank),
      winrateAB: Number(vehicleFormState.winrateAB),
      winrateRB: Number(vehicleFormState.winrateRB),
      winrateSB: Number(vehicleFormState.winrateSB),
      descriptionUA: vehicleFormState.descriptionUA || vehicleFormState.name,
      descriptionEN: vehicleFormState.descriptionEN || vehicleFormState.name,
      ammoUA: vehicleFormState.ammoUA || "Стандартні",
      ammoEN: vehicleFormState.ammoEN || "Standard",
      abGuideUA: vehicleFormState.abGuideUA || "Атакуйте ворогів",
      abGuideEN: vehicleFormState.abGuideEN || "Engage hostiles",
      rbGuideUA: vehicleFormState.rbGuideUA || "Займайте висоти",
      rbGuideEN: vehicleFormState.rbGuideEN || "Secure heights",
      sbGuideUA: vehicleFormState.sbGuideUA || "Уважно оглядайте",
      sbGuideEN: vehicleFormState.sbGuideEN || "Scout carefully"
    };

    setVehicles(prev => [formatted, ...prev]);
    setVehicleSearch(vehicleFormState.name);
    
    // Clear the state
    setVehicleFormState({
      name: "",
      nation: "usa",
      type: "ground",
      classUA: "ОБТ",
      classEN: "MBT",
      br: 11.7,
      rank: 8,
      winrateAB: 50.0,
      winrateRB: 50.0,
      winrateSB: 50.0,
      descriptionUA: "",
      descriptionEN: "",
      ammoUA: "",
      ammoEN: "",
      abGuideUA: "",
      abGuideEN: "",
      rbGuideUA: "",
      rbGuideEN: "",
      sbGuideUA: "",
      sbGuideEN: "",
      imageUrlsString: "",
      localImages: [],
      youtubeUrlsString: ""
    });

    setImportMessage({ text: lang === "uk" ? "Техніку успішно додано разом із медіаконтентом!" : "Vehicle successfully added with rich media content!", error: false });
  };

  const handleAddCustomMap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMap.nameUA.trim()) return;
    const newId = "custom_map_" + Date.now();

    // Combine external URLs and local base64 files
    const externalUrls = manualMap.imageUrlsString
      .split(",")
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    const combinedImages = [...manualMap.localImages, ...externalUrls];

    // Save paths/images to dynamic JSON mapsImagesState structure!
    if (combinedImages.length > 0) {
      setMapsImagesState(prev => ({
        ...prev,
        [newId]: combinedImages
      }));
    }

    // Parse and process videos
    const parsedVideos = manualMap.youtubeUrlsString
      .split(",")
      .map(url => extractYoutubeId(url))
      .filter((id): id is string => id !== null);

    // Add parsed videos to the global videos state collection matching the map
    if (parsedVideos.length > 0) {
      const newVideosList = parsedVideos.map((yId, idx) => ({
        id: `vid_custom_map_${newId}_${idx}_${Date.now()}`,
        targetId: newId,
        category: "maps",
        titleUA: `${manualMap.nameUA} - Відеоогляд карти #${idx + 1}`,
        titleEN: `${manualMap.nameEN} - Dynamic map walkthrough #${idx + 1}`,
        youtubeId: yId
      }));
      setVideos(prev => [...newVideosList, ...prev]);
    }

    // Create formatted map object
    const formatted: MapData = {
      id: newId,
      nameUA: manualMap.nameUA,
      nameEN: manualMap.nameEN || manualMap.nameUA,
      version: manualMap.version || "1.0",
      date: manualMap.date || "2026",
      type: manualMap.type as any,
      descriptionUA: manualMap.descriptionUA || manualMap.nameUA,
      descriptionEN: manualMap.descriptionEN || manualMap.nameEN || manualMap.nameUA,
      youtubeId: parsedVideos[0] || "", // First parsed video is assigned as main backup channel
      tacticalPoints: [
        // pre-populate interactive points
        {
          id: `point_default_spawn1_${newId}`,
          type: "allied_spawn",
          x: 23,
          y: 78,
          labelUA: "Респ Союзників A",
          labelEN: "Allied Spawn A",
          descUA: "Початкова безпечна зона висадки синіх сил",
          descEN: "Initial safe spawn point of blue armor elements"
        },
        {
          id: `point_default_spawn2_${newId}`,
          type: "enemy_spawn",
          x: 77,
          y: 23,
          labelUA: "Респ Ворогів A",
          labelEN: "Enemy Spawn A",
          descUA: "Стартовий плацдарм сил противника",
          descEN: "Primary positioning grounds of aggressive hostile spawners"
        },
        {
          id: `point_default_cap_${newId}`,
          type: "cap_point",
          x: 50,
          y: 50,
          labelUA: "Точка A",
          labelEN: "Capture zone A",
          descUA: "Центральна домінантна точка на карті",
          descEN: "Strategic center capture circle critical for ticket superiority"
        }
      ]
    };

    setMaps(prev => [formatted, ...prev]);
    setSelectedMapId(newId);
    
    // Clear map form
    setManualMap({
      nameUA: "",
      nameEN: "",
      version: "1.0",
      date: "2026",
      type: "ground",
      descriptionUA: "",
      descriptionEN: "",
      imageUrlsString: "",
      localImages: [],
      youtubeUrlsString: ""
    });

    setImportMessage({ text: lang === "uk" ? "Тактичну карту успішно інтегровано разом із медіаконтентом!" : "Tactical map integrated into database with dynamic visual gallery and videos!", error: false });
  };

  // --- Form addition states for Admin YouTube Videos ---
  const [adminVideoForm, setAdminVideoForm] = useState({
    category: "vehicles",
    targetId: "",
    titleUA: "",
    titleEN: "",
    youtubeUrl: "",
  });
  const [adminVideoError, setAdminVideoError] = useState("");
  const [adminVideoSuccess, setAdminVideoSuccess] = useState("");

  // Automatically select the first target of selected category
  useEffect(() => {
    if (adminVideoForm.category === "vehicles" && vehicles.length > 0) {
      setAdminVideoForm(prev => ({ ...prev, targetId: vehicles[0].id }));
    } else if (adminVideoForm.category === "maps" && maps.length > 0) {
      setAdminVideoForm(prev => ({ ...prev, targetId: maps[0].id }));
    } else {
      setAdminVideoForm(prev => ({ ...prev, targetId: "battles" }));
    }
  }, [adminVideoForm.category, vehicles, maps]);

  // Robust YouTube URL/ID parser
  const extractYoutubeId = (urlOrId: string): string | null => {
    if (!urlOrId) return null;
    const trimmed = urlOrId.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const match = trimmed.match(regex);
    return match ? match[1] : null;
  };

  const handleAddAdminVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminVideoError("");
    setAdminVideoSuccess("");

    const yId = extractYoutubeId(adminVideoForm.youtubeUrl);
    if (!yId) {
      setAdminVideoError(lang === "uk" ? "Неправильний формат YouTube URL або ID" : "Invalid YouTube URL or Video ID format");
      return;
    }

    if (!adminVideoForm.titleUA.trim() || !adminVideoForm.titleEN.trim()) {
      setAdminVideoError(lang === "uk" ? "Введіть назви обома мовами" : "Provide video title in both languages");
      return;
    }

    const newVideo = {
      id: `vid_custom_${Date.now()}`,
      targetId: adminVideoForm.category === "battles" ? "battles" : adminVideoForm.targetId,
      category: adminVideoForm.category,
      titleUA: adminVideoForm.titleUA.trim(),
      titleEN: adminVideoForm.titleEN.trim(),
      youtubeId: yId,
    };

    setVideos((prev) => [newVideo, ...prev]);
    setAdminVideoSuccess(lang === "uk" ? "Відеогайд успішно додано!" : "YouTube video walkthrough added successfully!");
    setAdminVideoForm(prev => ({
      ...prev,
      titleUA: "",
      titleEN: "",
      youtubeUrl: "",
    }));
  };

  const handleDeleteAdminVideo = (videoId: string) => {
    if (confirm(lang === "uk" ? "Ви впевнені, що хочете видалити цей відеогайд?" : "Are you sure you want to delete this video guide?")) {
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      setAdminVideoSuccess(lang === "uk" ? "Відеогайд успішно видалено" : "Video guide successfully deleted");
    }
  };

  // --- Dynamic calculations ---
  const currentMap = useMemo(() => {
    return maps.find(m => m.id === selectedMapId) || maps[0];
  }, [maps, selectedMapId]);

  const currentMapSpecs = useMemo(() => {
    if (!currentMap) return {
      mapSize: 4000,
      activeSize: 4000,
      gridCols: 10,
      gridRows: 10,
      imageUrl: "",
      flankingRoutes: [],
      heatmapZones: []
    };
    const staticSpecs = WAR_THUNDER_MAPS_SPECS[currentMap.id];
    const customImgs = mapsImagesState[currentMap.id] || [];
    const firstImg = customImgs.length > 0 ? customImgs[0] : "";
    const fallbackImage = firstImg || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";

    const localWebpFile = LOCAL_MAP_WEBP_MAPPING[currentMap.id];
    // Encode space characters to %20 to avoid loading issues in CSS or image paths
    const localWebpUrl = localWebpFile ? `/${encodeURIComponent(localWebpFile)}` : "";

    return {
      mapSize: (currentMap as any).mapSize ?? staticSpecs?.mapSize ?? 4000,
      activeSize: (currentMap as any).activeSize ?? staticSpecs?.activeSize ?? 4000,
      gridCols: (currentMap as any).gridCols ?? staticSpecs?.gridCols ?? 10,
      gridRows: (currentMap as any).gridRows ?? staticSpecs?.gridRows ?? 10,
      imageUrl: localWebpUrl || (currentMap as any).imageUrl || staticSpecs?.imageUrl || fallbackImage,
      flankingRoutes: (currentMap as any).flankingRoutes ?? staticSpecs?.flankingRoutes ?? [],
      heatmapZones: (currentMap as any).heatmapZones ?? staticSpecs?.heatmapZones ?? []
    };
  }, [currentMap, mapsImagesState]);

  const currentMapPresets = useMemo(() => {
    if (!currentMap || !currentMapSpecs) return [];
    const spawns = currentMap.tacticalPoints.filter(p => p.type.includes("spawn"));
    const caps = currentMap.tacticalPoints.filter(p => p.type === "cap_point");
    
    interface PresetDist {
      fromUA: string;
      fromEN: string;
      toUA: string;
      toEN: string;
      dist: number;
    }
    const list: PresetDist[] = [];
    spawns.forEach(sp => {
      caps.forEach(cp => {
        const d = calculateRealDistance(sp, cp, currentMapSpecs.mapSize);
        list.push({
          fromUA: sp.labelUA,
          fromEN: sp.labelEN,
          toUA: cp.labelUA,
          toEN: cp.labelEN,
          dist: d
        });
      });
    });
    
    if (caps.length >= 2) {
      for (let i = 0; i < caps.length - 1; i++) {
        const cp1 = caps[i];
        const cp2 = caps[i+1];
        const d = calculateRealDistance(cp1, cp2, currentMapSpecs.mapSize);
        list.push({
          fromUA: cp1.labelUA,
          fromEN: cp1.labelEN,
          toUA: cp2.labelUA,
          toEN: cp2.labelEN,
          dist: d
        });
      }
    }
    return list;
  }, [currentMap, currentMapSpecs]);

  // Set default point when selected map changes
  useEffect(() => {
    if (currentMap && currentMap.tacticalPoints.length > 0) {
      setSelectedPoint(currentMap.tacticalPoints[0]);
    } else {
      setSelectedPoint(null);
    }
  }, [currentMap]);

  // Available unique battle ratings from vehicles list
  const availableBrs = useMemo(() => {
    const brs = Array.from(new Set(vehicles.map(v => v.br)));
    return brs.sort((a: number, b: number) => a - b);
  }, [vehicles]);

  // Available unique setups BR list
  const availableSetupBrs = useMemo(() => {
    const brs = Array.from(new Set(setups.map(s => s.br)));
    return brs.sort((a: number, b: number) => a - b);
  }, [setups]);

  // Available unique nations dynamically extracted from the vehicles dataset
  const availableNations = useMemo(() => {
    const nations = Array.from(new Set(vehicles.map(v => v.nation).filter(Boolean)));
    return nations.sort();
  }, [vehicles]);

  // Filtered and sorted vehicles
  const filteredVehicles = useMemo(() => {
    const list = vehicles.filter(v => {
      const searchLower = vehicleSearch.toLowerCase();
      const matchesSearch = v.name.toLowerCase().includes(searchLower) ||
        v.classUA.toLowerCase().includes(searchLower) ||
        v.classEN.toLowerCase().includes(searchLower) ||
        v.nation.toLowerCase().includes(searchLower);
      
      const matchesNation = selectedNation === "all" || v.nation === selectedNation;
      const matchesType = selectedForce === "all" || v.type === selectedForce;
      const matchesBr = brFilter === "all" || v.br === Number(brFilter);
      
      // Fallback calculator for ranks (Rank 1 to 8 based on Battle Rating if rank is empty)
      const resolvedRank = v.rank || (v.br >= 11.0 ? 8 : v.br >= 9.0 ? 7 : v.br >= 7.3 ? 6 : v.br >= 6.0 ? 5 : v.br >= 4.7 ? 4 : v.br >= 3.3 ? 3 : v.br >= 2.0 ? 2 : 1);
      const matchesRank = rankFilter === "all" || resolvedRank === Number(rankFilter);

      return matchesSearch && matchesNation && matchesType && matchesBr && matchesRank;
    });

    // Apply sorting logic
    return list.sort((a, b) => {
      if (sortBy === "br_desc") return b.br - a.br;
      if (sortBy === "br_asc") return a.br - b.br;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "winrate_ab") return b.winrateAB - a.winrateAB;
      if (sortBy === "winrate_rb") return b.winrateRB - a.winrateRB;
      if (sortBy === "winrate_sb") return b.winrateSB - a.winrateSB;
      return 0;
    });
  }, [vehicles, vehicleSearch, selectedNation, selectedForce, brFilter, rankFilter, sortBy]);

  // Filtered maps for map sidebar selector
  const filteredMaps = useMemo(() => {
    return maps.filter(m => {
      const term = mapSearch.toLowerCase();
      return m.nameUA.toLowerCase().includes(term) || m.nameEN.toLowerCase().includes(term);
    });
  }, [maps, mapSearch]);

  // Recommended setup finder
  const activeSetup = useMemo(() => {
    return setups.find(s => s.br === setupBrFilter && s.nation === setupNationFilter);
  }, [setups, setupBrFilter, setupNationFilter]);

  // JSON importer routine
  const handleJsonImport = () => {
    try {
      if (!jsonInput.trim()) {
        setImportMessage({ text: t.invalidJson, error: true });
        return;
      }
      const data = JSON.parse(jsonInput);

      if (data.vehicles && Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
      }
      if (data.maps && Array.isArray(data.maps)) {
        setMaps(data.maps);
      }
      if (data.ammunition && Array.isArray(data.ammunition)) {
        setAmmunition(data.ammunition);
      }
      if (data.news && Array.isArray(data.news)) {
        setNews(data.news);
      }
      if (data.setups && Array.isArray(data.setups)) {
        setSetups(data.setups);
      }

      setImportMessage({ text: t.customStatsLoaded, error: false });
      setJsonInput("");
    } catch (err: any) {
      setImportMessage({ text: `${t.importError}${err.message}`, error: true });
    }
  };

  // Reset to blueprint static initial data
  const handleResetData = () => {
    localStorage.clear();
    setVehicles(initialVehicles);
    setMaps(initialMaps);
    setAmmunition(initialAmmunition);
    setNews(initialNews);
    setSetups(initialSetups);
    setImportMessage({ text: t.databaseReset, error: false });
  };

  // Export full databases
  const handleExportData = () => {
    const payload = {
      vehicles,
      maps,
      ammunition,
      news,
      setups
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `war_thunder_tactical_hub_db_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- Liquipedia Map Intelligence Sourcing ---
  // Returns real Liquipedia-style attributes, dimension scales, and strategic notes for tactical maps
  const getLiquipediaMapDetails = (mapId: string) => {
    switch (mapId) {
      case "kuban":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Передгір'я & Гори",
          terrainEN: "Foothills & Mountains",
          complexityUA: "Висока (Горбистий рельєф)",
          complexityEN: "High (Hilly Terrain)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Kuban",
          tacticalTipUA: "Основна боротьба розгортається за висоту 112 та центральну ущелину. Рекомендується використовувати техніку з хорошими кутами вертикальної наводки (УВН).",
          tacticalTipEN: "The primary struggle unfolds over Hill 112 and the central ravine. Utilizing vehicles with excellent gun depression (UHN) is highly recommended."
        };
      case "kursk":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Відкриті поля & Рівнини",
          terrainEN: "Open Fields & Plains",
          complexityUA: "Середня (Снайперські дуелі)",
          complexityEN: "Medium (Sniper Duels)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Fire_Arc",
          tacticalTipUA: "Ідеально для далекобійної снайперської дуелі. Контролюйте лісові насадження та пагорби навколо центрального селища.",
          tacticalTipEN: "Ideal for long-range sniping duels. Keep control of the treelines and hills surrounding the central village."
        };
      case "mozdok":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Горбиста долина річки",
          terrainEN: "Hilly River Valley",
          complexityUA: "Висока (Мало укриттів)",
          complexityEN: "High (Scarce Cover)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Mozdok",
          tacticalTipUA: "Використовуйте складки рельєфу вздовж річища. Західний фланг дозволяє здійснити глибокий обхід для захоплення тилу ворога.",
          tacticalTipEN: "Utilize terrain folds along the riverbed. The western flank allows a deep sweep to capture enemy rear lines."
        };
      case "hurtgen":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Густий Хвойний Ліс",
          terrainEN: "Dense Coniferous Forest",
          complexityUA: "Середня (Обмежена видимість)",
          complexityEN: "Medium (Limited Visibility)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Hurtgen_Forest",
          tacticalTipUA: "Східне містечко надає гарні укриття для міського бою, тоді як західні пагорби контролюють підходи до точок.",
          tacticalTipEN: "The eastern town offers great cover for close-quarters urban combat, while the western hills dominate path transitions."
        };
      case "berlin":
        return {
          size: "2.0 x 2.0 km",
          terrainUA: "Зруйноване Місто",
          terrainEN: "Ruined City Overlooking Reichstag",
          complexityUA: "Середня (Ближній бій)",
          complexityEN: "Medium (Close Quarters)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Berlin",
          tacticalTipUA: "Уникайте відкритої площі перед Рейхстагом без крайньої потреби. Маневруйте між зруйнованими будинками на флангах.",
          tacticalTipEN: "Avoid the open square in front of the Reichstag unless absolutely necessary. Maneuver through ruined structures on either flank."
        };
      case "normandy":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Узбережжя & Живоплоти",
          terrainEN: "Coastline & Bocage Plains",
          complexityUA: "Середня (Змішаний бій)",
          complexityEN: "Medium (Mixed Combat)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Normandy",
          tacticalTipUA: "Пляжна зона на півночі є дуже відкритою. Контроль південного містечка забезпечує накриття більшості позицій.",
          tacticalTipEN: "The northern beach zone is heavily exposed. Controlling the southern town provides fire lines over most capture positions."
        };
      case "finland":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Сніг, Лід & Скелі",
          terrainEN: "Snow, Ice & Granite Cliffs",
          complexityUA: "Висока (Ковзка крига)",
          complexityEN: "High (Slippery Ice Surfaces)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Finland",
          tacticalTipUA: "Центральний замерзлий пролив є смертельною пасткою. Рухайтеся кам'яними проходами та тунелями на флангах.",
          tacticalTipEN: "The central frozen channel is a death trap. Move through rock corridors and flank pathways protectively."
        };
      case "rhine":
        return {
          size: "2.0 x 2.0 km",
          terrainUA: "Густа Міська Забудова",
          terrainEN: "Dense Urban City grid",
          complexityUA: "Низька (Передбачувані провулки)",
          complexityEN: "Low (Predictable Alleyways)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Advance_to_the_Rhine",
          tacticalTipUA: "Контролюйте довгі проспекти снайперськими танками. Використовуйте кутовий обхід на легкій техніці для раптових засідок.",
          tacticalTipEN: "Dominate the long avenues utilizing sniper tanks. Use angular corners on light scouts for quick ambushes."
        };
      case "stalingrad":
        return {
          size: "2.0 x 2.0 km",
          terrainUA: "Засніжена Промзона",
          terrainEN: "Snowy Industrial Ruins",
          complexityUA: "Середня (Лабіринти залізниць)",
          complexityEN: "Medium (Railway Maze)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Stalingrad",
          tacticalTipUA: "Залізничні вагони та ангари слугують відмінним тактичним укриттям. Обережно перетинайте відкриті залізничні колії.",
          tacticalTipEN: "Railway wagons and industrial warehouses serve as excellent tactical covers. Cross empty tracks with extreme caution."
        };
      case "elalamein":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Пустельні Дюни & Оаза",
          terrainEN: "Desert Dunes & Oasis",
          complexityUA: "Висока (Піщані пагорби)",
          complexityEN: "High (Sandy Dune Crests)",
          liquipediaUrl: "https://liquipedia.net/warthunder/El_Alamein",
          tacticalTipUA: "Пагорби на сході дають контроль над більшістю карти. Використовуйте піщані бархани як природне укриття.",
          tacticalTipEN: "The eastern ridges provide broad sightlines. Use sandy dunes as natural continuous hull-down covers."
        };
      case "tunis":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Пустельний Каньйон & Мости",
          terrainEN: "Desert Canyon & Bridges",
          complexityUA: "Висока (Зміна темпу бою)",
          complexityEN: "High (Varying Pace)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Tunisia",
          tacticalTipUA: "Боріться за міські квартали на правому березі або грайте від скелястих уступів навколо річки у центрі.",
          tacticalTipEN: "Fight inside urban town divisions on the right bank or play hull-down around the river channels in the center."
        };
      case "volokolamsk":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Зимові Поля & Селище",
          terrainEN: "Siberian Winter Wilderness",
          complexityUA: "Висока (Глибокий сніг)",
          complexityEN: "High (Deep Snow Drag)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Volokolamsk",
          tacticalTipUA: "Лісові масиви приховують обхідні маневри. Ховайтеся за дерев'яними ізбами у центральному селищі.",
          tacticalTipEN: "Conifer forests conceal wide flanking maneuvers. Use traditional wooden izba structures in the village center as solid shields."
        };
      case "novorossiysk":
        return {
          size: "2.0 x 2.0 km",
          terrainUA: "Порт & Міські Квартали",
          terrainEN: "Portside Urban Districts",
          complexityUA: "Середня (Бетонні завали)",
          complexityEN: "Medium (Debris Cover)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Novorossiysk",
          tacticalTipUA: "Широке шосе прострілюється з обох кінців. Використовуйте вузькі двори та трамвайні колії для безпечного пересування.",
          tacticalTipEN: "The grand highway is heavily sniped. Navigate narrow courtyard splits and tram railway tracks for safer advances."
        };
      case "sinai":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Кам'яниста Пустеля",
          terrainEN: "Arid Rocky Desert",
          complexityUA: "Середня (Просторі фланги)",
          complexityEN: "Medium (Expansive Flanks)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Sinai",
          tacticalTipUA: "Захоплення пагорба А дозволяє контролювати підступи супротивника. Оберігайтеся відкритих флангів біля точки С.",
          tacticalTipEN: "Securing Hill A secures broad control over hostile approach vectors. Guard against exposed flanking runs near point C."
        };
      case "abandoned_factory":
        return {
          size: "2.0 x 2.0 km",
          terrainUA: "Промзона & Цехи",
          terrainEN: "Decommissioned Heavy Industry",
          complexityUA: "Висока (Багато кутів)",
          complexityEN: "High (Countless Angles)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Abandoned_Factory",
          tacticalTipUA: "Лабіринти заводських цехів ідеальні для раптових атак. Уникайте довгих відкритих проїздів між складами.",
          tacticalTipEN: "The industrial warehouse maze is perfect for quick close-quarters matches. Avoid long open lanes inside central yards."
        };
      case "ardennes":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Передгір'я & Лісисте Селище",
          terrainEN: "Wooded Ardennes Plains",
          complexityUA: "Середня (Густа рослинність)",
          complexityEN: "Medium (Thick Vegetation)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Ardennes",
          tacticalTipUA: "Рідкісні лісосмуги дозволяють приховано підібратися до міста. Центральне містечко Бастонь є основним вогнищем бою.",
          tacticalTipEN: "Scattered treelines permit stealth approaches. The central town of Bastogne remains the main tactical conflict center."
        };
      case "fulda":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Урочища & Замок Фулда",
          terrainEN: "Fulda Gap Border Meadows",
          complexityUA: "Висока (Великий масштаб)",
          complexityEN: "High (Enormous Proportions)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Fulda_Gap",
          tacticalTipUA: "Контролюйте вітряні електростанції та замок. Тут висока дальність стрільби, тож обов'язкове використання дальномірів.",
          tacticalTipEN: "Dominate the wind turbine farm and the central medieval castle. Laser rangefinders excel here due to extremely long ranges."
        };
      case "maginot":
        return {
          size: "4.0 x 4.0 km",
          terrainUA: "Поля & Бетонні Бункери",
          terrainEN: "Agricultural Hills & Forts",
          complexityUA: "Висока (Пагорби Бокаж)",
          complexityEN: "High (Bocage Crests)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Maginot_Line",
          tacticalTipUA: "Величні бункери лінії Мажино стримують ворожі снаряди. Контролюйте лівий горбистий фланг для підтиску респавнів.",
          tacticalTipEN: "The solid concrete bunkers absorb shell splashes perfectly. Secure the left hilly pasture to choke enemy transit corridors."
        };
      case "italy":
        return {
          size: "3.0 x 3.0 km",
          terrainUA: "Італійське Вілла-Місто",
          terrainEN: "Campanian Coastal Village",
          complexityUA: "Середня (Північні пагорби)",
          complexityEN: "Medium (Northern Foothills)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Campania",
          tacticalTipUA: "Північні оливкові сади чудово підходять для засідок. Руїни стародавнього замку у центрі є ключем до панування над точками.",
          tacticalTipEN: "The northern olive groves offer clean ambush nooks. The ancient castle ruins in the center key entire map control."
        };
      case "breslau":
        return {
          size: "2.0 x 2.0 km",
          terrainUA: "Густі Квартали & Канал",
          terrainEN: "Historic Breslau Center & Canals",
          complexityUA: "Середня (Проспекти)",
          complexityEN: "Medium (Wide Boulevards)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Breslau",
          tacticalTipUA: "Великий водний канал ділить місто на дві частини. Тримайте оборону біля мостів та використовуйте димові снаряди.",
          tacticalTipEN: "The massive water canal splits the city. Secure the canal bridges firmly and deploy smoke rounds during advances."
        };
      case "abandoned_city":
        return {
          size: "2.5 x 2.5 km",
          terrainUA: "Сучасне Покинуте Місто",
          terrainEN: "Post-Soviet Abandoned City",
          complexityUA: "Висока (Тривимірні провулки)",
          complexityEN: "High (3D Line of Sights)",
          liquipediaUrl: "https://liquipedia.net/warthunder/Abandoned_City",
          tacticalTipUA: "Міські хащі та недобудовані хмарочоси створюють складні кути вогню. Тримайте вуха відкритими, щоб чути наближення танків.",
          tacticalTipEN: "Constructed ruins and skeletal high-rises make complex firing angles. Listen closely for engine sounds in block splits."
        };
      default:
        return {
          size: "3.0 x 3.0 km",
          terrainUA: "Змішаний",
          terrainEN: "Mixed Terrain",
          complexityUA: "Середня",
          complexityEN: "Medium Complexity",
          liquipediaUrl: "https://liquipedia.net/warthunder/Portal:Maps",
          tacticalTipUA: "Маневруйте з розумом, тримайтеся союзників та приховано міняйте позиції після кожного вдалого пострілу.",
          tacticalTipEN: "Maneuver carefully, stick close to squadmates, and relocate to fresh firing lanes after every successful target hit."
        };
    }
  };

  // --- Terrain Draw Function ---
  // Renders distinct procedural topographic graphics for each requested map matching its identity
  const getProceduralTerrainStyle = (mapId: string) => {
    switch (mapId) {
      case "finland": // Snowy icy setup
        return {
          background: "linear-gradient(135deg, #e4f0f6 0%, #b9d7e5 100%)",
          accentColor: "#337ab7"
        };
      case "elalamein":
      case "sinai":
      case "tunis": // Desert sands setup
        return {
          background: "linear-gradient(135deg, #efe2c8 0%, #d8be93 100%)",
          accentColor: "#aa7a22"
        };
      case "berlin":
      case "rhine":
      case "novorossiysk":
      case "abandoned_factory":
      case "breslau": // Industrial concrete town
        return {
          background: "linear-gradient(135deg, #e3e3e3 0%, #acafb5 100%)",
          accentColor: "#61666d"
        };
      case "kuban":
      case "hurtgen":
      case "volokolamsk": // Pine forests and swamps
      default:
        return {
          background: "linear-gradient(135deg, #cedfc9 0%, #9cb994 100%)",
          accentColor: "#426738"
        };
    }
  };

  const activeTerrain = getProceduralTerrainStyle(currentMap ? currentMap.id : "default");

  return (
    <div className={`${darkMode ? "dark" : ""} bg-theme-bg text-theme-secondary min-h-screen font-sans transition-colors duration-200 flex flex-col`}>
      
      {/* GLOBAL BANNER COWL */}
      <header className="border-b border-slate-200 dark:border-hd-dark-border bg-white dark:bg-hd-dark-header sticky top-0 z-40" id="app_header">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-md text-white shadow-md shadow-red-500/10 flex items-center justify-center">
              <Compass className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5 uppercase leading-none dark:text-hd-dark-text-bright">
                Tundra <span className="text-red-500">Tactic Hub</span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Controls Panel (Theme, Flags/Languages, Offlinks) */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Download Now Link */}
            <a 
              href="https://warthunder.com/download" 
              target="_blank" 
              rel="noreferrer" 
              className="text-[11px] bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-1 rounded border border-red-600 transition-all flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>{t.downloadGame}</span>
            </a>

            {/* Language Selector Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-[11px] font-bold bg-slate-100 dark:bg-hd-dark-active hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1 rounded border border-transparent dark:border-hd-dark-border transition">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{languages.find(l => l.code === lang)?.flag}</span>
                <span className="hidden sm:inline">{languages.find(l => l.code === lang)?.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded shadow-xl hidden group-hover:block hover:block z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-hd-dark-active transition ${
                      lang === l.code ? "bg-slate-100 dark:bg-hd-dark-active/50 font-bold text-red-500" : ""
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle Button (With Status Indicator styling) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center bg-slate-100 dark:bg-hd-dark-bg border border-slate-250 dark:border-hd-dark-border-light rounded px-2 py-1 select-none transition hover:opacity-90"
              aria-label="Toggle Theme"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${darkMode ? "bg-yellow-500" : "bg-blue-500"}`} />
              <span className="text-[10px] ml-2 font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                {darkMode ? "Dark Mode Active" : "Light Mode Active"}
              </span>
            </button>

          </div>
        </div>

        {/* PRIMARY TAB SYSTEM */}
        <div className="bg-slate-100 dark:bg-hd-dark-sidebar border-t border-slate-250 dark:border-hd-dark-border">
          <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-0.5 scrollbar-none">
            {[
              { id: "vehicles", label: t.navVehicles, icon: Shield },
              { id: "maps", label: t.navMaps, icon: Compass },
              { id: "ammo", label: t.navAmmo, icon: Target },
              { id: "setups", label: t.navSetups, icon: Award },
              { id: "news", label: t.navNews, icon: BookOpen },
              { id: "stats", label: t.navStats, icon: Database }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-3.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                    isActive 
                      ? "border-red-600 text-red-500 bg-white/40 dark:bg-hd-dark-active" 
                      : "border-transparent text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* EXTERNAL LINK TREE FOR REAL DATA INTEGRITY */}
      <div className="bg-theme-surface py-2 border-b border-theme-border text-[10px] md:text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2.5 font-mono text-theme-secondary">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
            <span className="font-semibold text-theme-primary">GAIJIN ONLINE:</span>
            <a href="https://store.gaijin.net" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-all flex items-center gap-0.5 text-theme-secondary">
              {t.gajinStore} <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-theme-border">|</span>
            <a href="https://login.gaijin.net" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-all flex items-center gap-0.5 text-theme-secondary">
              {t.gajinAccount} <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-theme-border">|</span>
            <a href="https://gaijin.net/vacancies" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-all flex items-center gap-0.5 text-theme-secondary">
              {t.gajinCareers} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="text-theme-secondary font-bold flex items-center gap-1">
            <span>{t.wikiSource}:</span>
            <a href="https://wiki-ru.warthunder.com/" target="_blank" rel="noreferrer" className="text-amber-600 hover:underline flex items-center gap-0.5">
              WIKI PORTAL <ExternalLink className="w-3.5 h-3.5 inline" />
            </a>
          </div>
        </div>
      </div>

      {/* PRIMARY CONTAINER CONSOLE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:py-6" id="app_main_layout">
        
        {/* TAB CONDITIONAL RENDERINGS */}

        {/* 1. VEHICLES TAB PANEL */}
        {activeTab === "vehicles" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-fade-in" id="vehicles_panel">
            
            {/* Filter sidebar */}
            <div className="lg:col-span-1 bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border p-3.5 rounded-lg shadow-xs self-start">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-hd-dark-border pb-2.5 mb-3.5">
                <Filter className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider">{t.navVehicles} Filters</h3>
              </div>

              {/* Text Search */}
              <div className="mb-3.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.searchPlaceholder}</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-450 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="e.g. Tiger, Leopard..."
                    className="w-full bg-slate-50 dark:bg-hd-dark-bg border border-slate-200 dark:border-hd-dark-border text-slate-800 dark:text-hd-dark-text-bright rounded pl-8.5 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Nation Selector */}
              <div className="mb-3.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.faction}</label>
                <select
                  value={selectedNation}
                  onChange={(e) => setSelectedNation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-hd-dark-bg border border-slate-200 dark:border-hd-dark-border text-slate-800 dark:text-hd-dark-text-bright rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                >
                  <option value="all">{t.allNations}</option>
                  {availableNations.map((nat) => {
                    const info = NATIONS_MAP[nat] || { flag: "🏳️", nameUA: nat.toUpperCase(), nameEN: nat.toUpperCase() };
                    const label = lang === "uk" ? `${info.flag} ${info.nameUA}` : `${info.flag} ${info.nameEN}`;
                    return (
                      <option key={nat} value={nat}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Force selection type */}
              <div className="mb-3.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.combatForces}</label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: "all", label: t.allForces },
                    { id: "ground", label: t.ground },
                    { id: "aircraft", label: t.aviation },
                    { id: "helicopter", label: t.helicopter },
                    { id: "coastal_fleet", label: t.coastal_fleet },
                    { id: "bluewater_fleet", label: t.bluewater_fleet }
                  ].map(bt => (
                    <button
                      key={bt.id}
                      onClick={() => setSelectedForce(bt.id)}
                      className={`px-1 py-1.5 border rounded-md text-[10px] font-semibold uppercase transition ${
                        selectedForce === bt.id 
                           ? "bg-red-700 border-red-600 text-white font-bold" 
                           : "border-slate-200 dark:border-hd-dark-border hover:bg-slate-50 dark:hover:bg-hd-dark-active text-slate-400"
                      }`}
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rank Filter */}
              <div className="mb-3.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.rankInput} (Rank I — VIII)</label>
                <select
                  value={rankFilter}
                  onChange={(e) => setRankFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-hd-dark-bg border border-slate-200 dark:border-hd-dark-border text-slate-800 dark:text-hd-dark-text-bright rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                >
                  <option value="all">
                    {t.allRanks}
                  </option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(r => (
                    <option key={r} value={r}>
                      {t.rankInput} {r} (Rank {["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][r - 1]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Battle Rating selector */}
              <div className="mb-3.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t.brLabel}</label>
                <select
                  value={brFilter}
                  onChange={(e) => setBrFilter(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-hd-dark-bg border border-slate-200 dark:border-hd-dark-border text-slate-800 dark:text-hd-dark-text-bright rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                >
                  <option value="all">{t.allBattleRatings}</option>
                  {availableBrs.map(br => (
                    <option key={br} value={br}>BR {br.toFixed(1)}</option>
                  ))}
                </select>
              </div>

              {/* Sort selector */}
              <div className="mb-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  {t.sortListLabel}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-hd-dark-bg border border-slate-200 dark:border-hd-dark-border text-slate-800 dark:text-hd-dark-text-bright rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-600 focus:outline-hidden"
                >
                  <option value="br_desc">{t.sortByBrDesc}</option>
                  <option value="br_asc">{t.sortByBrAsc}</option>
                  <option value="name_asc">{t.sortByName}</option>
                  <option value="winrate_rb">{t.sortByRb}</option>
                  <option value="winrate_ab">{t.sortByAb}</option>
                  <option value="winrate_sb">{t.sortBySb}</option>
                </select>
              </div>

            </div>

            {/* List column */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              
              {/* Telemetry info header */}
              <div className="bg-slate-100 dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border p-3 rounded-lg flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-hd-dark-text">
                  <Activity className="w-4 h-4 text-red-500 font-bold" />
                  <span>{t.performanceIndicators}</span>
                </div>
                <div className="text-slate-550 dark:text-slate-400">
                  {t.foundVehicles}: <span className="font-bold text-slate-800 dark:text-hd-dark-text-bright">{filteredVehicles.length}</span>
                </div>
              </div>

              {filteredVehicles.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-xl">
                  <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold max-w-md mx-auto px-4 text-slate-500">
                    {t.noDataMessage}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredVehicles.slice(0, visibleCount).map((v) => (
                    <div 
                      key={v.id} 
                      className="bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg overflow-hidden shadow-xs hover:shadow-md transition"
                    >
                      <div className="bg-slate-50 dark:bg-hd-dark-sidebar p-3.5 border-b border-slate-150 dark:border-hd-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Name & BR */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-red-750 border border-red-600 text-white font-bold rounded text-[10px]">
                              BR {v.br.toFixed(1)}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-hd-dark-bg text-slate-650 dark:text-slate-350 font-black rounded text-[10px]">
                              {t.rankInput} {v.rank || (v.br >= 11.0 ? 8 : v.br >= 9.0 ? 7 : v.br >= 7.3 ? 6 : v.br >= 6.0 ? 5 : v.br >= 4.7 ? 4 : v.br >= 3.3 ? 3 : v.br >= 2.0 ? 2 : 1)}
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wide text-slate-400">
                              {(() => {
                                const nationsLookup: Record<string, string> = {
                                  usa: "🇺🇸 USA",
                                  germany: "🇩🇪 Germany",
                                  ussr: "🇷🇺 USSR",
                                  great_britain: "🇬🇧 GB",
                                  japan: "🇯🇵 Japan",
                                  china: "🇨🇳 China",
                                  italy: "🇮🇹 Italy",
                                  france: "🇫🇷 France",
                                  sweden: "🇸🇪 Sweden",
                                  israel: "🇮🇱 Israel"
                                };
                                return nationsLookup[v.nation] || v.nation?.toUpperCase() || "";
                              })()} • {lang === "uk" ? v.classUA : v.classEN}
                            </span>
                          </div>
                          <h4 className="text-base font-black tracking-tight mt-1 text-slate-800 dark:text-hd-dark-text-bright">{v.name}</h4>
                        </div>

                        {/* Win rates stats metrics */}
                        <div className="flex items-center gap-2.5 text-center font-mono">
                          {[
                            { mode: "AB", val: v.winrateAB },
                            { mode: "RB", val: v.winrateRB },
                            { mode: "SB", val: v.winrateSB }
                          ].map(stat => (
                            <div key={stat.mode} className="bg-slate-100 dark:bg-hd-dark-bg p-1.5 rounded-md border border-slate-200 dark:border-hd-dark-border-light min-w-[50px]">
                              <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">{stat.mode}</p>
                              <p className={`text-xs font-black ${
                                stat.val >= 53 
                                  ? "text-green-500" 
                                  : stat.val <= 49 
                                    ? "text-red-500" 
                                    : "text-amber-500"
                              }`}>
                                {stat.val ? `${stat.val.toFixed(1)}%` : "N/A"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-4">
                        
                        {/* Column 1: Image Gallery */}
                        <div className="lg:col-span-3 flex flex-col gap-2">
                          <VehicleImageGallery vehicleId={v.id} title={v.name} customImages={vehiclesImagesState[v.id]} />
                        </div>

                        {/* Column 2: Tactical Info */}
                        <div className="lg:col-span-5 flex flex-col gap-3">
                          <div>
                            <p className="text-xs text-slate-650 dark:text-hd-dark-text italic leading-relaxed">
                              {lang === "uk" ? v.descriptionUA : v.descriptionEN}
                            </p>
                          </div>

                          {/* Shell Guidance block */}
                          <div className="bg-slate-50 dark:bg-hd-dark-bg/85 p-2.5 rounded-md border border-slate-150 dark:border-hd-dark-border">
                            <h5 className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5" />
                              {t.recommendedAmmo}
                            </h5>
                            <p className="text-xs font-mono font-bold text-slate-750 dark:text-hd-dark-text-bright">
                              {lang === "uk" ? v.ammoUA : v.ammoEN}
                            </p>
                          </div>

                          {/* Tactical positioning guides per game modes */}
                          <div className="grid grid-cols-1 gap-1.5">
                            {[
                              { label: t.guideAB, txt: lang === "uk" ? v.abGuideUA : v.abGuideEN, color: "bg-blue-550/15 text-blue-500 border-blue-500/20" },
                              { label: t.guideRB, txt: lang === "uk" ? v.rbGuideUA : v.rbGuideEN, color: "bg-red-500/15 text-red-500 border-red-500/20" },
                              { label: t.guideSB, txt: lang === "uk" ? v.sbGuideUA : v.sbGuideEN, color: "bg-purple-550/15 text-purple-500 border-purple-500/20" }
                            ].map((guide, idx) => (
                              <div key={idx} className="border border-slate-150 dark:border-hd-dark-border p-2 rounded-md">
                                <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${guide.color}`}>
                                  {guide.label}
                                </span>
                                <p className="text-[11px] text-slate-650 dark:text-hd-dark-text mt-1.5 font-medium leading-relaxed">
                                  {guide.txt}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Column 3: Multi-Video Guides */}
                        <div className="lg:col-span-4 flex flex-col justify-start">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                            YouTube Tactical Walkthroughs
                          </span>
                          <VehicleVideoWalkthrough vehicleId={v.id} title={v.name} defaultYoutubeId={v.youtubeId} lang={lang} videosList={videos} />
                        </div>

                      </div>
                    </div>
                  ))}
                  {filteredVehicles.length > visibleCount && (
                    <div className="flex justify-center pt-2 pb-1">
                      <button
                        onClick={() => setVisibleCount(prev => prev + 12)}
                        className="px-6 py-2.5 bg-red-750 hover:bg-red-800 text-white font-bold rounded shadow-md border border-red-600 transition tracking-wide text-xs uppercase flex items-center gap-1.5"
                      >
                        {t.showMoreBtn} ({filteredVehicles.length - visibleCount} {t.remaining})
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* 2. TACTICAL MAPS OVERLAYS PANELS */}
        {activeTab === "maps" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in" id="maps_panel">
            
            {/* Sidebar with 21 maps */}
            <div className="lg:col-span-4 bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg p-3.5 shadow-xs self-start">
              
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-hd-dark-border pb-2.5 mb-3.5">
                <Compass className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  {t.tacticalMapsTitle} ({maps.length})
                </h3>
              </div>

              {/* Map search */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                <input
                  type="text"
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  placeholder={t.mapSearchPlaceholder}
                  className="w-full bg-slate-50 dark:bg-hd-dark-bg border border-slate-200 dark:border-hd-dark-border text-slate-850 dark:text-hd-dark-text-bright rounded pl-8.5 pr-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Select map scroll panel */}
              <div className="max-h-[384px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {filteredMaps.map(m => {
                  const isSelected = m.id === selectedMapId;
                  const mapSpecs = WAR_THUNDER_MAPS_SPECS[m.id];
                  const customImgs = mapsImagesState[m.id] || [];
                  const firstImg = customImgs.length > 0 ? customImgs[0] : "";
                  
                  const localWebp = LOCAL_MAP_WEBP_MAPPING[m.id];
                  const mapImg = localWebp ? `/${encodeURIComponent(localWebp)}` : (m.imageUrl || mapSpecs?.imageUrl || firstImg || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=60");
                  
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMapId(m.id)}
                      className={`w-full text-left p-2.5 rounded transition text-xs relative overflow-hidden group border ${
                        isSelected 
                          ? "border-red-600 text-white font-bold shadow-md" 
                          : "border-slate-200 dark:border-hd-dark-border hover:border-slate-450 text-slate-100"
                      }`}
                      style={{
                        backgroundImage: `linear-gradient(${isSelected ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.78)'}, ${isSelected ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.78)'}), url(${mapImg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        textShadow: "1px 1px 3px rgba(0,0,0,0.9)",
                      }}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <span className="font-extrabold text-xs">
                          {lang === "uk" ? m.nameUA : m.nameEN}
                        </span>
                        <span className="text-[9px] font-mono bg-red-600/90 text-white px-1.5 py-0.5 rounded font-bold shadow-sm">
                          v{m.version}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-bold relative z-10 mt-1 flex justify-between items-center">
                        <span>{t.yearLabel}: {m.date}</span>
                        <span className="text-[8px] uppercase font-black bg-black/40 px-1.5 py-0.5 rounded text-amber-400">
                          {m.type === "ground" ? (lang === "uk" ? "Наземні" : "Ground") : (lang === "uk" ? "Повітряні" : "Aviation")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Official wiki alert and attribution */}
              <div className="mt-3.5 p-2.5 bg-slate-100 dark:bg-hd-dark-bg border border-slate-150 dark:border-hd-dark-border rounded text-[10px] text-slate-450 text-center font-mono">
                {t.mapVerificationText}
              </div>

            </div>

            {/* Interactive Overlaid Map Container */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              
              <div className="bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg overflow-hidden shadow-sm">
                
                {/* Header info */}
                <div className="border-b border-slate-200 dark:border-hd-dark-border p-3.5 bg-slate-50 dark:bg-hd-dark-sidebar flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="p-2 bg-red-600/10 text-red-500 rounded-md">
                      <Compass className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm dark:text-hd-dark-text-bright">
                        {lang === "uk" ? currentMap.nameUA : currentMap.nameEN}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {t.theaterTitle}
                      </p>
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="flex items-center gap-1">
                    {(["all", "spawns", "caps", "snipers", "ambushes"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setMapPointFilter(filter)}
                        className={`px-2.5 py-1 text-[9.5px] font-extrabold uppercase rounded-md cursor-pointer transition ${
                          mapPointFilter === filter
                            ? "bg-red-650 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-hd-dark-bg text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                        }`}
                      >
                        {filter === "all" && t.filterAll}
                        {filter === "spawns" && t.filterSpawns}
                        {filter === "caps" && t.filterCaps}
                        {filter === "snipers" && t.filterSnipers}
                        {filter === "ambushes" && t.filterAmbushes}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-150 dark:divide-hd-dark-border animate-fade-in">
                  
                  {/* Real-world Proportions Map Theatre */}
                  <div className="md:col-span-8 p-4 bg-slate-900 border-b md:border-b-0 dark:bg-slate-950 flex flex-col items-center justify-between gap-4 select-none">
                    
                    {/* Floating Tactical HUD Info */}
                    <div className="w-full bg-slate-910/75 backdrop-blur-md border border-slate-705/50 p-2.5 rounded-md flex flex-wrap gap-2.5 items-center justify-between text-white font-mono text-[10px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 uppercase text-[8px] tracking-widest">{t.theaterSpecs}</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-red-500">
                          <span>{t.totalSizeLabel}</span>
                          <span>{currentMapSpecs.mapSize >= 1000 ? `${(currentMapSpecs.mapSize / 1000).toFixed(1)} x ${(currentMapSpecs.mapSize / 1000).toFixed(1)} км` : `${currentMapSpecs.mapSize} x ${currentMapSpecs.mapSize} м`}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 uppercase text-[8px] tracking-widest">{t.gridCellScale}</span>
                        <div className="font-bold text-slate-200">
                          1 {t.oneCellEquals} {Math.round(currentMapSpecs.mapSize / currentMapSpecs.gridCols)} {lang === "uk" ? "м(метрів)" : "m(meters)"}
                        </div>
                      </div>

                      {/* Display ruler results if points are placed */}
                      {rulerStart && rulerEnd ? (
                        <div className="bg-red-950/80 text-red-400 border border-red-500/30 px-2 py-1 rounded-sm text-[10px] font-bold animate-pulse flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5" />
                          <span>
                            {t.laserRuler} [ {getPointCoordinate(rulerStart, currentMapSpecs.gridRows, currentMapSpecs.gridCols)} ] ➔ [ {getPointCoordinate(rulerEnd, currentMapSpecs.gridRows, currentMapSpecs.gridCols)} ] ({Math.round(calculateRealDistance(rulerStart, rulerEnd, currentMapSpecs.mapSize))} {lang === "uk" ? "м" : "m"})
                          </span>
                        </div>
                      ) : rulerActive ? (
                        <div className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-sm text-[9px] font-bold animate-pulse">
                          🎯 {t.set2Coordinates}
                        </div>
                      ) : null}
                    </div>

                    {/* HUD Control Toggles Toolbar */}
                    <div className="w-full flex flex-wrap gap-2 justify-start">
                      {/* Heatmap overlay switch */}
                      <button 
                        onClick={() => setHeatmapActive(!heatmapActive)}
                        className={`text-[9px] font-bold uppercase px-2.5 py-1.5 border rounded flex items-center gap-1 cursor-pointer transition ${
                          heatmapActive 
                            ? "bg-amber-600/20 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]" 
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>{t.heatmapLabel}</span>
                      </button>

                      {/* Flank routes overlay switch */}
                      <button 
                        onClick={() => setRoutesActive(!routesActive)}
                        className={`text-[9px] font-bold uppercase px-2.5 py-1.5 border rounded flex items-center gap-1 cursor-pointer transition ${
                          routesActive 
                            ? "bg-emerald-600/20 border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{t.flanksLabel}</span>
                      </button>

                      {/* Ruler active toggle */}
                      <button 
                        onClick={() => {
                          setRulerActive(!rulerActive);
                          if (rulerActive) {
                            setRulerStart(null);
                            setRulerEnd(null);
                          }
                        }}
                        className={`text-[9px] font-bold uppercase px-2.5 py-1.5 border rounded flex items-center gap-1 cursor-pointer transition ${
                          rulerActive 
                            ? "bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.15)] ring-1 ring-red-500" 
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>{t.laserRangefinderLabel}</span>
                      </button>

                      {/* Clear ruler targets if any */}
                      {(rulerStart || rulerEnd) && (
                        <button
                          onClick={() => {
                            setRulerStart(null);
                            setRulerEnd(null);
                          }}
                          className="text-[9px] font-bold uppercase px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                        >
                          {t.clearRuler}
                        </button>
                      )}

                      {/* Interactive click-zoom toolbar controls block */}
                      <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white select-none">
                        <button
                          onClick={() => setMapZoom((prev) => Math.max(1, prev - 0.5))}
                          disabled={mapZoom <= 1}
                          className="w-4 h-4 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Zoom Out"
                        >
                          -
                        </button>
                        <span className="text-[9px] font-mono font-bold px-1.5 text-center min-w-[32px] text-slate-300">
                          {Math.round(mapZoom * 100)}%
                        </span>
                        <button
                          onClick={() => setMapZoom((prev) => Math.min(5, prev + 0.5))}
                          disabled={mapZoom >= 5}
                          className="w-4 h-4 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Zoom In"
                        >
                          +
                        </button>
                        {mapZoom > 1 && (
                          <button
                            onClick={() => {
                              setMapZoom(1);
                              setMapPan({ x: 0, y: 0 });
                            }}
                            className="ml-1.5 text-[8px] uppercase tracking-wider font-extrabold text-red-400 hover:text-red-300 border-l border-slate-700 pl-1.5 cursor-pointer"
                          >
                            {t.zoomReset}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Exact Active Image Source Path Indicator */}
                    <div className="w-full max-w-[340px] sm:max-w-[380px] bg-slate-100 dark:bg-hd-dark-sidebar border border-slate-200 dark:border-hd-dark-border rounded px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono select-all">
                      <span className="text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider text-[8px]">
                        {lang === "uk" ? "ШЛЯХ ДO ЗOБРAЖEННЯ" : "ACTIVE IMAGE PATH"}
                      </span>
                      <span className="text-red-500 font-extrabold break-all text-right" id="active_map_image_src">
                        {decodeURIComponent(currentMapSpecs.imageUrl || "")}
                      </span>
                    </div>

                    {/* Infinite Theater Cage holding the Map */}
                    <div 
                      className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] border-2 border-slate-700 rounded-lg overflow-hidden flex items-center justify-center p-0.5 shadow-2xl bg-[#020617]"
                      style={{
                        backgroundImage: currentMapSpecs.imageUrl ? `url(${currentMapSpecs.imageUrl})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }}
                    >
                      
                      {/* Proportional Graphical Scale Overlay Box */}
                      <div className="absolute bottom-2.5 left-2.5 z-20 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded px-2.5 py-1 text-white select-none pointer-events-none flex flex-col gap-0.5 shadow-md font-mono border-l-2 border-l-red-500">
                        <span className="text-[7px] tracking-widest uppercase text-slate-400 font-black">
                          {lang === "uk" ? "МАСШТАБ СІТКИ" : "GRID CELL SCALE"}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-100">
                          <span>1 {lang === "uk" ? "клітинка" : "cell"} = {Math.round(currentMapSpecs.mapSize / currentMapSpecs.gridCols)} {lang === "uk" ? "м" : "m"}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5" style={{ width: '48px' }}>
                          <div className="h-1 bg-white/20 relative flex-1 rounded-xs overflow-hidden border border-white/30">
                            <div className="absolute inset-y-0 left-0 w-1/2 bg-red-500" />
                          </div>
                          <span className="text-[7px] text-slate-400 font-bold">100%</span>
                        </div>
                      </div>

                      {/* Sub-Theater Infinite Coordinate Crosshairs backdrop */}
                      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-15 pointer-events-none select-none">
                        {Array.from({ length: 100 }).map((_, idx) => (
                          <div key={idx} className="border-[0.5px] border-slate-500/25 relative col-span-1 row-span-1">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-slate-600 rounded-full animate-pulse"></div>
                          </div>
                        ))}
                      </div>

                      {/* Map Canvas itself, scaled smoothly depending on real map size relative to 4.0km map */}
                      {(() => {
                        const relativeScale = currentMapSpecs.mapSize / 4000;
                        const scalePct = Math.max(50, Math.min(100, Math.round(relativeScale * 100)));
                        
                        // Handler for canvas distance clicks
                        const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
                          if (!rulerActive) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                          const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                          
                          if (!rulerStart || (rulerStart && rulerEnd)) {
                            setRulerStart({ x, y });
                            setRulerEnd(null);
                          } else {
                            setRulerEnd({ x, y });
                          }
                        };

                        return (
                          <div 
                            ref={mapCanvasRef}
                            className="relative aspect-square rounded-md overflow-hidden shadow-inner flex flex-col z-10 select-none origin-center"
                            style={{ 
                              width: `${scalePct}%`, 
                              height: `${scalePct}%`,
                              background: "#090d16",
                              transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`,
                              transition: isDragging ? "none" : "transform 0.12s ease-out, background 0.3s ease-in-out",
                              cursor: rulerActive ? "crosshair" : mapZoom > 1 ? (isDragging ? "grabbing" : "grab") : "default"
                            }}
                            id="tactical_map_canvas"
                            onClick={handleCanvasClick}
                            onMouseDown={handleMapMouseDown}
                            onMouseMove={handleMapMouseMove}
                            onMouseUp={handleMapMouseUpOrLeave}
                            onMouseLeave={handleMapMouseUpOrLeave}
                            onTouchStart={handleMapTouchStart}
                            onTouchMove={handleMapTouchMove}
                            onTouchEnd={handleMapTouchEnd}
                          >
                            
                            {/* Realistic Map Imagery Background Layer from War Thunder files */}
                            {currentMapSpecs.imageUrl ? (
                              <img 
                                src={currentMapSpecs.imageUrl} 
                                alt={currentMap.nameEN} 
                                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-[0.9] hover:opacity-100 transition-opacity"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  // Fallback gracefully to background representation on load error
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : null}

                            {/* Warning overlay if this map does not have a static local WebP file map assignment */}
                            {!LOCAL_MAP_WEBP_MAPPING[currentMap.id] && (
                              <div className="absolute inset-x-4 top-4 z-40 bg-amber-500/90 text-white font-extrabold text-[10px] p-2 rounded-md shadow-lg flex items-center gap-1.5 backdrop-blur-xs font-sans">
                                <span>⚠️ {lang === "uk" ? "Попередження: Для цієї карти не прив'язано локальний файл зображення WEBP!" : "Warning: No local WEBP image file bound to this map!"}</span>
                              </div>
                            )}

                            {/* Topographic Lines Overlay as decorative layer when image fails or loads */}
                            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0,80 Q100,120 200,80 T400,100" fill="none" stroke={activeTerrain.accentColor} strokeWidth="1.5" />
                              <path d="M0,180 Q150,150 250,220 T400,180" fill="none" stroke={activeTerrain.accentColor} strokeWidth="1.5" />
                              <path d="M0,280 Q80,310 180,260 T400,320" fill="none" stroke={activeTerrain.accentColor} strokeWidth="1.5" />
                              <path d="M120,0 Q180,150 80,250 T220,400" fill="none" stroke={activeTerrain.accentColor} strokeWidth="1.5" />
                            </svg>

                            {/* Scalable Tactical Coordinate System Grid Overlays */}
                            <div 
                              className="absolute inset-0 grid pointer-events-none border border-white/20 select-none z-10"
                              style={{
                                gridTemplateColumns: `repeat(${currentMapSpecs.gridCols}, minmax(0, 1fr))`,
                                gridTemplateRows: `repeat(${currentMapSpecs.gridRows}, minmax(0, 1fr))`
                              }}
                            >
                              {Array.from({ length: currentMapSpecs.gridCols * currentMapSpecs.gridRows }).map((_, idx) => {
                                const colNum = (idx % currentMapSpecs.gridCols) + 1; // 1..gridCols
                                const rowLetter = String.fromCharCode(65 + Math.floor(idx / currentMapSpecs.gridCols)); // A..I or A..J
                                return (
                                  <div key={idx} className="border-[0.5px] border-white/5 relative col-span-1 row-span-1 col-start-auto col-end-auto row-start-auto row-end-auto">
                                    <span className="text-[6.5px] text-white/25 dark:text-slate-400/25 font-mono absolute bottom-0.5 right-0.5 select-none font-bold">
                                      {rowLetter}{colNum}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Warm Battle Density Heatmaps Overlay (Toggled) */}
                            {heatmapActive && currentMapSpecs.heatmapZones.map((zone, index) => {
                              // Dynamic physical radius transformation
                              const radiusPct = (zone.radius / currentMapSpecs.mapSize) * 100;
                              return (
                                <div 
                                  key={index}
                                  className="absolute rounded-full pointer-events-auto cursor-help mix-blend-screen transition-all duration-500 z-15"
                                  style={{
                                    width: `${radiusPct * 2}%`,
                                    height: `${radiusPct * 2}%`,
                                    left: `${zone.x}%`,
                                    top: `${zone.y}%`,
                                    transform: "translate(-50%, -50%)",
                                    background: `radial-gradient(circle, rgba(239, 68, 68, ${zone.intensity / 100}) 0%, rgba(249, 115, 22, ${zone.intensity / 200}) 40%, rgba(239, 68, 68, 0) 70%)`
                                  }}
                                  title={`${lang === "uk" ? zone.labelUA : zone.labelEN} - Інтенсивність: ${zone.intensity}% (Радіус: ${zone.radius}м)`}
                                />
                              );
                            })}

                            {/* SVG Interactive Flanking Routes (Toggled) */}
                            {routesActive && (
                              <svg className="absolute inset-0 w-full h-full pointer-events-none z-15 select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {currentMapSpecs.flankingRoutes.map((route) => {
                                  // Map vertices to a coherent SVG path
                                  const dPath = route.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                                  
                                  // Compute total route length in meters
                                  let routeDist = 0;
                                  for (let i = 0; i < route.points.length - 1; i++) {
                                    routeDist += calculateRealDistance(route.points[i], route.points[i+1], currentMapSpecs.mapSize);
                                  }
                                  const distLabel = routeDist >= 1000 ? `${(routeDist / 1000).toFixed(2)} км` : `${Math.round(routeDist)} м`;

                                  return (
                                    <g key={route.id} className="cursor-help pointer-events-auto" title={`${lang === "uk" ? route.nameUA : route.nameEN} (${distLabel}) – ${lang === "uk" ? route.descUA : route.descEN}`}>
                                      {/* Glowing guide shadows */}
                                      <path 
                                        d={dPath} 
                                        fill="none" 
                                        stroke="rgba(16, 185, 129, 0.25)" 
                                        strokeWidth="3.5" 
                                        strokeLinecap="round" 
                                      />
                                      {/* Main dashed flow path */}
                                      <path 
                                        d={dPath} 
                                        fill="none" 
                                        stroke="#10b981" 
                                        strokeWidth="1.2" 
                                        strokeDasharray="3 2" 
                                        strokeLinecap="round" 
                                      />
                                      {/* Vertices indicator pins */}
                                      {route.points.map((p, pIdx) => (
                                        <circle 
                                          key={pIdx} 
                                          cx={p.x} 
                                          cy={p.y} 
                                          r="1.2" 
                                          fill="#10b981" 
                                          stroke="white" 
                                          strokeWidth="0.3" 
                                        />
                                      ))}
                                    </g>
                                  );
                                })}
                              </svg>
                            )}

                            {/* Dynamic Laser Measurement Overlays */}
                            {rulerStart && (
                              <div className="absolute pointer-events-none inset-0 z-18">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  {/* Point A marker */}
                                  <circle cx={rulerStart.x} cy={rulerStart.y} r="1.5" fill="#ef4444" stroke="white" strokeWidth="0.4" />
                                  
                                  {rulerEnd && (
                                    <>
                                      {/* Point B marker */}
                                      <circle cx={rulerEnd.x} cy={rulerEnd.y} r="1.5" fill="#ef4444" stroke="white" strokeWidth="0.4" />
                                      {/* Laser connector line */}
                                      <line 
                                        x1={rulerStart.x} 
                                        y1={rulerStart.y} 
                                        x2={rulerEnd.x} 
                                        y2={rulerEnd.y} 
                                        stroke="#ef4444" 
                                        strokeWidth="0.8" 
                                        strokeDasharray="2 1.5" 
                                      />
                                    </>
                                  )}
                                </svg>
                              </div>
                            )}

                            {/* PLOTTED ABSOLUTE COORDINATES MAP PIN PLACEMENTS */}
                            {currentMap.tacticalPoints.filter(p => {
                              if (mapPointFilter === "spawns") return p.type.includes("spawn");
                              if (mapPointFilter === "caps") return p.type === "cap_point";
                              if (mapPointFilter === "snipers") return p.type === "sniper";
                              if (mapPointFilter === "ambushes") return p.type === "ambush";
                              return true;
                            }).map((pt) => {
                              const isSelected = selectedPoint?.id === pt.id;
                              
                              // Stylized category badges
                              let bgClass = "bg-red-500 text-slate-950";
                              if (pt.type === "allied_spawn") bgClass = "bg-blue-600 text-white animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.4)]";
                              if (pt.type === "enemy_spawn") bgClass = "bg-red-650 text-white shadow-[0_0_10px_rgba(185,28,28,0.4)]";
                              if (pt.type === "sniper") bgClass = "bg-purple-600 text-white shadow-purple-500/50";
                              if (pt.type === "ambush") bgClass = "bg-yellow-500 text-slate-950 shadow-yellow-500/50";
                              if (pt.type === "danger_zone") bgClass = "bg-rose-700 text-white shadow-red-700/50";
                              if (pt.type === "flank") bgClass = "bg-emerald-600 text-white shadow-emerald-500/50";

                              return (
                                <button
                                  key={pt.id}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Avoid ruler marking conflict on pin clicking
                                    setSelectedPoint(pt);
                                  }}
                                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-7.5 h-7.5 rounded-full border border-white font-mono text-[10px] font-black shadow-lg cursor-pointer transition-all hover:scale-115 z-20 ${bgClass} ${
                                    isSelected ? "ring-4 ring-offset-1 ring-red-650 scale-115 z-30" : ""
                                  }`}
                                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                                  title={`${lang === "uk" ? pt.labelUA : pt.labelEN} [${getPointCoordinate(pt, gridRows, currentMapSpecs.gridCols)}]`}
                                >
                                  {/* Category label or dynamic symbols */}
                                  {pt.type === "allied_spawn" && "S"}
                                  {pt.type === "enemy_spawn" && "E"}
                                  {pt.type === "cap_point" && (pt.labelUA.includes("B") ? "B" : pt.labelUA.includes("C") ? "C" : pt.labelUA.includes("A") ? "A" : pt.labelUA.slice(0, 1))}
                                  {pt.type === "sniper" && <Target className="w-3 h-3" />}
                                  {pt.type === "ambush" && <Eye className="w-3 h-3" />}
                                  {pt.type === "danger_zone" && <Skull className="w-3 h-3" />}
                                  {pt.type === "flank" && <Compass className="w-3 h-3" />}
                                </button>
                              );
                            })}

                          </div>
                        );
                      })()}
                    </div>
                    
                    {/* Footnote instruction */}
                    <div className="w-full text-center text-[10px] text-theme-secondary italic font-medium leading-relaxed bg-theme-bg border border-theme-border p-2.5 rounded-md">
                      {t.mapProTip}
                    </div>

                  </div>

                  {/* Sidebar description values on hover/click */}
                  <div className="md:col-span-4 p-3 border-t md:border-t-0 md:border-l border-slate-205 dark:border-hd-dark-border flex flex-col justify-between">
                    
                    <div>
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400">
                          {t.pointDetailsTitle}
                        </h4>
                      </div>

                      {selectedPoint ? (
                        <div className="space-y-3.5">
                          <div>
                            <span className="text-[9px] font-bold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase">
                              {selectedPoint.type.replace("_", " ")}
                            </span>
                            <h5 className="font-black text-xs mt-1 dark:text-hd-dark-text-bright">{lang === "uk" ? selectedPoint.labelUA : selectedPoint.labelEN}</h5>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[10px] font-mono font-bold bg-red-650 text-white dark:bg-red-700/25 dark:text-red-400 px-1.5 py-0.5 rounded shadow-xs">
                                {t.sectorLabel} {getPointCoordinate(selectedPoint, gridRows)}
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-450 font-mono">
                                (X: {selectedPoint.x}% / Y: {selectedPoint.y}%)
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-hd-dark-text bg-slate-50 dark:bg-hd-dark-bg p-2.5 rounded-md border border-slate-150 dark:border-hd-dark-border font-medium leading-relaxed">
                            {lang === "uk" ? (selectedPoint.descUA || t.pointDefaultDesc) : (selectedPoint.descEN || t.pointDefaultDesc)}
                          </div>

                          {/* Quick modes instructions for selected map node */}
                          <div className="space-y-1.5">
                            <h6 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.deploymentMode}</h6>
                            <div className="text-[10px] font-semibold space-y-1">
                              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> {t.pointArcadeDesc}</p>
                              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-red-650 rounded-full"></span> {t.pointRealisticDesc}</p>
                              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> {t.pointSimDesc}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 text-xs font-mono">
                          {t.selectTacticalPoint}
                        </div>
                      )}
                    </div>

                    {/* YouTube Walkthrough of this map */}
                    <div className="pt-3 border-t border-slate-100 dark:border-hd-dark-border">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{t.youtubeTacticalGuide}:</span>
                      <MapVideoWalkthrough mapId={currentMap.id} defaultYoutubeId={currentMap.youtubeId} lang={lang} videosList={videos} />
                    </div>

                  </div>
                </div>

              </div>

              {/* General map tactical details guide */}
              <div className="bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg p-4">
                <h3 className="font-extrabold text-sm mb-1.5 text-slate-800 dark:text-hd-dark-text-bright">{t.mapGlobalDesc}</h3>
                <p className="text-xs text-slate-600 dark:text-hd-dark-text font-medium leading-relaxed mb-3.5">
                  {lang === "uk" ? currentMap.descriptionUA : currentMap.descriptionEN}
                </p>

                {/* Liquipedia Tactical Sourcing Details */}
                {(() => {
                  const liqInfo = getLiquipediaMapDetails(currentMap.id);
                  return (
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-hd-dark-sidebar border border-slate-150 dark:border-hd-dark-border rounded-md">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-hd-dark-border pb-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-red-500" />
                          <span className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-hd-dark-text-bright">
                            {t.liquipediaIntelligence}
                          </span>
                        </div>
                        <a 
                          href={liqInfo.liquipediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-650 transition cursor-pointer"
                        >
                          <span>{t.viewArticle}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-[11px]">
                        <div className="bg-white dark:bg-hd-dark-bg p-2 rounded border border-slate-100 dark:border-hd-dark-border">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                            {t.mapDetailsSize}
                          </span>
                          <span className="font-mono font-bold text-slate-750 dark:text-hd-dark-text-bright mt-0.5 block">
                            {liqInfo.size}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-hd-dark-bg p-2 rounded border border-slate-100 dark:border-hd-dark-border">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                            {t.mapDetailsLandscape}
                          </span>
                          <span className="font-bold text-slate-750 dark:text-hd-dark-text-bright mt-0.5 block">
                            {lang === "uk" ? liqInfo.terrainUA : liqInfo.terrainEN}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-hd-dark-bg p-2 rounded border border-slate-100 dark:border-hd-dark-border">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                            {t.mapDetailsComplexity}
                          </span>
                          <span className="font-bold text-slate-750 dark:text-hd-dark-text-bright mt-0.5 block">
                            {lang === "uk" ? liqInfo.complexityUA : liqInfo.complexityEN}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] leading-relaxed bg-white dark:bg-hd-dark-bg p-2.5 rounded border border-slate-100 dark:border-hd-dark-border text-slate-650 dark:text-hd-dark-text">
                        <span className="text-[9px] uppercase font-black text-red-500 block tracking-wide mb-1">
                          {t.liquipediaTacticalAdvice}
                        </span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {lang === "uk" ? liqInfo.tacticalTipUA : liqInfo.tacticalTipEN}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="border border-slate-150 dark:border-hd-dark-border p-2.5 rounded-md">
                    <span className="font-bold text-red-500 uppercase">{t.mapBenefits}</span>
                    <ul className="list-disc list-inside mt-1.5 text-slate-500 space-y-1">
                      <li>{t.mapBenefit1}</li>
                      <li>{t.mapBenefit2}</li>
                      <li>{t.mapBenefit3}</li>
                    </ul>
                  </div>
                  <div className="border border-slate-150 dark:border-hd-dark-border p-2.5 rounded-md">
                    <span className="font-bold text-red-600 uppercase">{t.mapThreats}</span>
                    <ul className="list-disc list-inside mt-1.5 text-slate-500 space-y-1">
                      <li>{t.mapThreat1}</li>
                      <li>{t.mapThreat2}</li>
                      <li>{t.mapThreat3}</li>
                    </ul>
                  </div>
                </div>

                {/* Tactical Images Gallery for current map */}
                {mapsImagesState[currentMap.id] && mapsImagesState[currentMap.id].length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-hd-dark-border">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2.5">
                      {lang === "uk" ? "📸 ДОДАТКОВІ ТАКТИЧНІ ЗНІМКИ КАРТИ:" : "📸 ADDITIONAL TACTICAL MAP VIEWS:"}
                    </span>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {mapsImagesState[currentMap.id].map((imgUrl, imgIdx) => (
                        <div 
                          key={imgIdx} 
                          onClick={() => setZoomedAmmoImage({ url: imgUrl, name: `${lang === "uk" ? currentMap.nameUA : currentMap.nameEN} (View ${imgIdx + 1})` })}
                          className="aspect-[4/3] rounded-md overflow-hidden bg-slate-900 border border-slate-200 dark:border-hd-dark-border cursor-pointer relative group shadow-sm hover:shadow-md transition-shadow"
                        >
                          <img 
                            src={imgUrl} 
                            alt={`Map View ${imgIdx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <ZoomIn className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic local static WebP assets mapping and warning table - render only if admin panel is verified */}
              {adminPassVerified && (
                <MapCorrespondenceTable 
                  lang={lang}
                  currentMap={currentMap}
                  maps={maps}
                  localMapMapping={LOCAL_MAP_WEBP_MAPPING}
                />
              )}

            </div>
          </div>
        )}

        {/* 3. AMMUNITION COMPARISON TABLE TAB */}
        {activeTab === "ammo" && (
          <div className="space-y-4 animate-fade-in" id="ammo_panel">
            
            {/* Header telemetry prompt */}
            <div className="bg-white dark:bg-hd-dark-header border border-slate-201 dark:border-hd-dark-border rounded-lg p-4">
              <h2 className="text-base font-black mb-1 text-slate-800 dark:text-hd-dark-text-bright">{t.ammoTableTitle}</h2>
              <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
                {t.ammoTableDesc}
              </p>
            </div>

            {/* Ammunitions bento grid cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ammunition.map((ammo) => (
                <div 
                  key={ammo.id} 
                  className="bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-3 border-b border-slate-150 dark:border-hd-dark-border bg-slate-50 dark:bg-hd-dark-sidebar flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black tracking-tight text-red-500">{ammo.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{lang === "uk" ? ammo.fullNameUA : ammo.fullNameEN}</p>
                    </div>
                  </div>

                  {/* Simulated Visual Cross-Section of shell type representing wiki layouts in premium aesthetics */}
                  <div className="p-3 bg-slate-100 dark:bg-hd-dark-bg/60 flex flex-col items-center justify-center border-b border-slate-150 dark:border-hd-dark-border">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">{t.ammoStructure}</span>
                    
                    {/* Visual procedural cross-sections in SVG to guarantee beautiful scaling */}
                    <div className="w-full h-22 flex items-center justify-center bg-slate-200 dark:bg-hd-dark-bg border border-slate-250 dark:border-hd-dark-border-light rounded-md p-2 relative">
                      
                      {ammo.ammoIcon === "apfsds" && (
                        <svg className="w-11/12 h-5/6" viewBox="0 0 160 50">
                          {/* Sabot casing */}
                          <polygon points="50,15 110,15 110,35 50,35 30,25" fill="#f59e0b" opacity="0.8"/>
                          {/* Subcaliber dark inner needle core */}
                          <rect x="20" y="22" width="130" height="6" fill="#1e293b" rx="2" />
                          <polygon points="150,21 160,25 150,29" fill="#1e293b" />
                          {/* Sabot separation lines */}
                          <line x1="80" y1="15" x2="80" y2="35" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
                          <text x="75" y="12" fill="#ef4444" fontSize="6" fontFamily="mono" fontWeight="bold">SABOT</text>
                        </svg>
                      )}

                      {ammo.ammoIcon === "aphe" && (
                        <svg className="w-11/12 h-5/6" viewBox="0 0 160 50">
                          {/* Brass copper shell body */}
                          <path d="M10,15 L110,15 Q140,25 150,25 Q140,25 110,35 L10,35 Z" fill="#b45309" opacity="0.9" />
                          {/* Inner explosive charge cavity colored in red */}
                          <rect x="40" y="19" width="40" height="12" fill="#ef4444" rx="1" />
                          {/* Fuse trigger at the base */}
                          <rect x="15" y="22" width="15" height="6" fill="#3b82f6" />
                          <text x="45" y="27" fill="#ffffff" fontSize="6" fontFamily="mono" fontWeight="bold">HE FILLER</text>
                          <text x="16" y="27" fill="#ffffff" fontSize="5" fontFamily="mono" fontWeight="bold">FUSE</text>
                        </svg>
                      )}

                      {ammo.ammoIcon === "heat" && (
                        <svg className="w-11/12 h-5/6" viewBox="0 0 160 50">
                          {/* Outer shell carrier container */}
                          <path d="M10,15 L120,15 L130,25 L120,35 L10,35 Z" fill="#a1a1aa" />
                          {/* Standoff rod fuse at tip */}
                          <rect x="130" y="23" width="22" height="4" fill="#3f3f46" />
                          {/* Inner copper funnel shaped-charge lining */}
                          <polygon points="70,17 110,25 70,33 90,25" fill="#f59e0b" />
                          {/* High explosive compound backing */}
                          <rect x="25" y="17" width="45" height="16" fill="#f43f5e" />
                          <text x="28" y="27" fill="#ffffff" fontSize="6" fontFamily="mono" fontWeight="bold">RDX BLAST</text>
                        </svg>
                      )}

                      {ammo.ammoIcon === "hesh" && (
                        <svg className="w-11/12 h-5/6" viewBox="0 0 160 50">
                          {/* Thin steel shell carrying plastified HE payload */}
                          <path d="M10,15 L110,15 C130,17 145,25 145,25 C145,25 130,33 110,35 L10,35 Z" fill="#4b5563" />
                          {/* Thick plastic high explosive padding */}
                          <path d="M30,18 L110,18 C120,20 135,25 135,25 C135,25 120,30 110,32 L30,32 Z" fill="#10b981" />
                          <text x="50" y="27" fill="#ffffff" fontSize="6" fontFamily="mono" fontWeight="bold">PLASTIC COMP-A3</text>
                        </svg>
                      )}

                      {ammo.ammoIcon === "apcr" && (
                        <svg className="w-11/12 h-5/6" viewBox="0 0 160 50">
                          {/* Soft outer shell carrier metal */}
                          <path d="M10,15 L120,15 Q140,25 145,25 Q140,25 120,35 L10,35 Z" fill="#d4d4d8" />
                          {/* Ultra hard composite inner tungsten carbide heavy core */}
                          <polygon points="40,20 100,20 120,25 100,30 40,30" fill="#0f172a" />
                          <text x="50" y="27" fill="#ffffff" fontSize="6" fontFamily="mono" fontWeight="bold">CARBIDE CORE</text>
                        </svg>
                      )}

                    </div>
                  </div>

                  <div className="p-3.5 space-y-3">
                    
                    {/* Primary parameters table */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-hd-dark-bg p-2 rounded-md border border-slate-150 dark:border-hd-dark-border">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">{t.caliber}</span>
                        <span className="font-extrabold text-slate-700 dark:text-hd-dark-text">{lang === "uk" ? ammo.caliberUA : ammo.caliberEN}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">{t.velocity}</span>
                        <span className="font-extrabold text-slate-700 dark:text-hd-dark-text">{ammo.velocity ? `${ammo.velocity} ${t.metersPerSecond}` : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">{t.explosiveMass}</span>
                        <span className="font-extrabold text-slate-700 dark:text-hd-dark-text">{ammo.explosiveMass ? `${ammo.explosiveMass}g` : t.kinetic}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">{t.cumulativeJet}</span>
                        <span className="font-extrabold text-slate-700 dark:text-hd-dark-text">{ammo.ammoIcon === "heat" ? t.copperJet : t.no}</span>
                      </div>
                    </div>

                    {/* Penetration telemetry indicator */}
                    <div className="space-y-1 bg-slate-50 dark:bg-hd-dark-bg p-2.5 rounded-md border border-slate-150 dark:border-hd-dark-border">
                      <span className="text-[9px] font-bold text-slate-400 block font-mono">{t.ammoPenetration}</span>
                      <div className="flex items-center gap-2 font-mono text-xs font-black">
                        <span className="text-green-500">{ammo.penetration10m}mm</span>
                        <span className="text-slate-400 dark:text-hd-dark-border">/</span>
                        <span className="text-red-500 font-black">{ammo.penetration500m}mm</span>
                        <span className="text-slate-400 dark:text-hd-dark-border">/</span>
                        <span className="text-red-700 font-black">{ammo.penetration2000m}mm</span>
                      </div>
                    </div>

                    {/* Real high quality ammunition shell preview from ammunition_images.json */}
                    {(() => {
                      const imageList = (ammunitionImages as Record<string, string[]>)[ammo.id];
                      const mainImage = imageList && imageList[0];
                      if (!mainImage) return null;
                      return (
                        <div className="flex items-center gap-2.5 p-2 bg-slate-100 dark:bg-hd-dark-bg/60 border border-slate-150 dark:border-hd-dark-border rounded-md relative select-none">
                          <img 
                            src={mainImage} 
                            alt={ammo.name} 
                            loading="lazy"
                            className="w-10 h-10 object-contain bg-slate-950 p-1 rounded border border-slate-200 dark:border-hd-dark-border cursor-zoom-in"
                            referrerPolicy="no-referrer"
                            onClick={() => {
                              setZoomedAmmoImage({ url: mainImage, name: ammo.name });
                            }}
                          />
                          <div className="flex-1 flex flex-col justify-center">
                            <span className="text-[8px] font-mono uppercase text-slate-400 font-bold leading-none">WIKI HIGH-QUALITY REF</span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-hd-dark-text-bright mt-1">{ammo.name} shell schematic</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Description characterization */}
                    <div className="text-[11px] text-slate-600 dark:text-hd-dark-text leading-relaxed font-semibold font-sans">
                      {lang === "uk" ? ammo.characteristicsUA : ammo.characteristicsEN}
                    </div>

                    {/* Warthunder wiki external link */}
                    <div className="pt-2 border-t border-slate-150 dark:border-hd-dark-border">
                      <a 
                        href={ammo.wikiUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {t.readWikiGuide} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 4. BEST LINEUPS MATCH SELECTION */}
        {activeTab === "setups" && (
          <div className="space-y-4 animate-fade-in" id="setups_panel">
            
            {/* Header selection query bar */}
            <div className="bg-white dark:bg-hd-dark-header border border-slate-201 dark:border-hd-dark-border rounded-lg p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-800 dark:text-hd-dark-text-bright">{t.recommendedLineup}</h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {t.lineupSubtitle}
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Nation Toggle */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.faction}</label>
                  <div className="flex gap-1">
                    {[
                      { id: "usa", label: "🇺🇸 USA" },
                      { id: "germany", label: "🇩🇪 GER" },
                      { id: "ussr", label: "🇷🇺 USSR" }
                    ].map(nt => (
                      <button
                        key={nt.id}
                        onClick={() => setSetupNationFilter(nt.id as any)}
                        className={`px-2.5 py-1 border rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                          setupNationFilter === nt.id 
                            ? "bg-red-700 border-red-650 text-white font-bold" 
                            : "border-slate-200 dark:border-hd-dark-border bg-white dark:bg-hd-dark-bg text-slate-500 hover:text-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {nt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BR selector */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.filterByBr}</label>
                  <select
                    value={setupBrFilter}
                    onChange={(e) => setSetupBrFilter(Number(e.target.value))}
                    className="bg-slate-50 dark:bg-hd-dark-bg border border-slate-200 dark:border-hd-dark-border rounded px-2.5 py-1 text-[11px] font-bold focus:ring-1 focus:ring-red-650 focus:outline-hidden dark:text-hd-dark-text-bright"
                  >
                    {availableSetupBrs.map(br => (
                      <option key={br} value={br}>BR {br.toFixed(1)}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* active setup detail */}
            {activeSetup ? (
              <div className="space-y-4">
                
                {/* Meta details card */}
                <div className="bg-white dark:bg-hd-dark-header border border-slate-205 dark:border-hd-dark-border p-4 rounded-lg shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                    <span className="text-[9px] font-bold bg-red-500/15 text-red-500 px-2 py-0.5 rounded uppercase tracking-wider">
                      {t.optimalSetup}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                      {t.difficulty}: <span className="text-slate-800 dark:text-hd-dark-text-bright font-black">{lang === "uk" ? activeSetup.difficultyUA : activeSetup.difficultyEN}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-black tracking-tight text-red-500">
                    {lang === "uk" ? activeSetup.titleUA : activeSetup.titleEN}
                  </h3>
                  <p className="text-xs mt-1.5 text-slate-600 dark:text-hd-dark-text font-semibold leading-relaxed max-w-4xl">
                    {lang === "uk" ? activeSetup.descriptionUA : activeSetup.descriptionEN}
                  </p>
                </div>

                {/* Tactical divisions of Army (Ground, Air, Naval) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  
                  {/* TANK FORCES */}
                  <div className="bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg p-3.5 space-y-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-150 dark:border-hd-dark-border">
                      <div className="p-1.5 bg-red-700 rounded text-white flex items-center justify-center">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs uppercase tracking-wide dark:text-hd-dark-text-bright">{t.groundForces}</h4>
                        <span className="text-[9px] text-slate-400 font-mono font-bold">{t.requiredGround}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {activeSetup.groundUnits.map((u, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-hd-dark-bg p-3 rounded-md border border-slate-150 dark:border-hd-dark-border">
                          <span className="text-[8px] font-bold bg-red-500/10 text-red-500 border border-red-500/15 px-1.5 py-0.5 rounded uppercase">
                            {u.type}
                          </span>
                          <h5 className="font-black text-xs mt-1 text-slate-800 dark:text-hd-dark-text-bright">{u.name}</h5>
                          <p className="text-[11px] text-slate-550 dark:text-hd-dark-text mt-1.5 leading-relaxed font-semibold">
                            {lang === "uk" ? u.roleUA : u.roleEN}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AIR CAS SUPPORT */}
                  <div className="bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg p-3.5 space-y-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-150 dark:border-hd-dark-border">
                      <div className="p-1.5 bg-red-700 rounded text-white flex items-center justify-center">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs uppercase tracking-wide dark:text-hd-dark-text-bright">{t.airSupport}</h4>
                        <span className="text-[9px] text-slate-400 font-mono font-bold">{t.airSupportCas}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {activeSetup.airUnits.map((u, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-hd-dark-bg p-3 rounded-md border border-slate-150 dark:border-hd-dark-border">
                          <span className="text-[8px] font-bold bg-red-500/10 text-red-500 border border-red-500/15 px-1.5 py-0.5 rounded uppercase">
                            {u.type}
                          </span>
                          <h5 className="font-black text-xs mt-1 text-slate-800 dark:text-hd-dark-text-bright">{u.name}</h5>
                          <p className="text-[11px] text-slate-550 dark:text-hd-dark-text mt-1.5 leading-relaxed font-semibold">
                            {lang === "uk" ? u.roleUA : u.roleEN}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NAVAL SUPPORT */}
                  <div className="bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg p-3.5 space-y-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-150 dark:border-hd-dark-border">
                      <div className="p-1.5 bg-red-700 rounded text-white flex items-center justify-center">
                        <Anchor className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs uppercase tracking-wide dark:text-hd-dark-text-bright">{t.navalEscort}</h4>
                        <span className="text-[9px] text-slate-400 font-mono font-bold">{t.navalSupport}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {activeSetup.navalUnits && activeSetup.navalUnits.length > 0 ? (
                        activeSetup.navalUnits.map((u, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-hd-dark-bg p-3 rounded-md border border-slate-150 dark:border-hd-dark-border">
                            <span className="text-[8px] font-bold bg-red-500/10 text-red-500 border border-red-500/15 px-1.5 py-0.5 rounded uppercase">
                              {u.type}
                            </span>
                            <h5 className="font-black text-xs mt-1 text-slate-800 dark:text-hd-dark-text-bright">{u.name}</h5>
                            <p className="text-[11px] text-slate-550 dark:text-hd-dark-text mt-1.5 leading-relaxed font-semibold">
                              {lang === "uk" ? u.roleUA : u.roleEN}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-slate-400 text-xs font-mono border border-dashed border-slate-250 dark:border-hd-dark-border rounded">
                          {t.navalSupportNav}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg">
                <Trophy className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="font-black text-xs mb-1 dark:text-hd-dark-text-bright">{t.notFoundTitle}</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto px-4 mt-1 leading-relaxed">
                  {t.notFoundDesc}
                </p>
              </div>
            )}

          </div>
        )}

        {/* 5. NEWS AND PATCHES FEED */}
        {activeTab === "news" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in" id="news_panel">
            
            {/* News list feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-hd-dark-header border border-slate-201 dark:border-hd-dark-border rounded-lg p-4">
                <h2 className="text-base font-black mb-0.5 text-slate-800 dark:text-hd-dark-text-bright">{t.newsTitle}</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  {t.newsSubtitle}
                </p>
              </div>

              {news.map((item) => (
                <article 
                  key={item.id} 
                  className="bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg overflow-hidden shadow-xs hover:shadow-xs transition p-4 space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono font-bold text-slate-400">
                    <span className="px-2 py-0.5 bg-red-500/15 text-red-500 rounded border border-red-500/10">
                      {lang === "uk" ? item.categoryUA : item.categoryEN}
                    </span>
                    <span>{item.date}</span>
                  </div>

                  <h3 className="text-sm font-black leading-tight hover:text-red-500 transition-colors text-slate-850 dark:text-hd-dark-text-bright">
                    {lang === "uk" ? item.titleUA : item.titleEN}
                  </h3>

                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic">
                    {lang === "uk" ? item.summaryUA : item.summaryEN}
                  </p>

                  <div className="text-[11px] whitespace-pre-wrap text-slate-600 dark:text-hd-dark-text leading-relaxed font-semibold pt-2 border-t border-slate-150 dark:border-hd-dark-border">
                    {lang === "uk" ? item.contentUA : item.contentEN}
                  </div>
                </article>
              ))}
            </div>

            {/* Quick official external links sidebar */}
            <div className="lg:col-span-1 space-y-4">
              
              <div className="bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg p-3.5 space-y-3">
                <h3 className="font-extrabold text-[11px] uppercase tracking-wider pb-2 border-b border-slate-150 dark:border-hd-dark-border flex items-center gap-1.5 dark:text-hd-dark-text-bright">
                  <Globe className="w-3.5 h-3.5 text-red-500" />
                  {t.usefulMaterials}
                </h3>

                <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-hd-dark-text">
                  <li>
                    <a href="https://wiki-ru.warthunder.com/Режимы_игры" target="_blank" rel="noreferrer" className="hover:text-red-500 flex items-center justify-between gap-1 cursor-pointer">
                      <span>{t.analytcisModes}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </li>
                  <li>
                    <a href="https://warthunder.com/ru/news" target="_blank" rel="noreferrer" className="hover:text-red-500 flex items-center justify-between gap-1 cursor-pointer">
                      <span>{t.patchNotes}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </li>
                  <li>
                    <a href="https://gaijinent.com/" target="_blank" rel="noreferrer" className="hover:text-red-500 flex items-center justify-between gap-1 cursor-pointer">
                      <span>{t.careersGajin}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </li>
                  <li>
                    <a href="https://forum.warthunder.com/" target="_blank" rel="noreferrer" className="hover:text-red-500 flex items-center justify-between gap-1 cursor-pointer">
                      <span>{t.forumDiscussions}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-red-500/5 dark:bg-red-500/10 border-2 border-red-500/20 p-4 rounded-lg space-y-3">
                <h4 className="font-black text-xs text-red-500 uppercase flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  {t.joinTheGame}
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-semibold">
                  {t.downloadGameDesc}
                </p>
                <a 
                  href="https://warthunder.com/download" 
                  target="_blank" 
                  rel="noreferrer"
                  className="block text-center w-full bg-red-700 hover:bg-red-800 text-white font-black text-xs uppercase py-2 rounded transition cursor-pointer"
                >
                  {t.downloadFree}
                </a>
              </div>

            </div>

          </div>
        )}

        {/* 6. STATS DATABASE IMPORT MANAGEMENT PORTAL (SCALABILITY) */}
        {activeTab === "stats" && !adminPassVerified && (
          <div className="max-w-md mx-auto my-12 bg-theme-card border border-theme-border rounded-xl p-6 space-y-6 shadow-xl animate-fade-in text-theme-primary" id="admin_lock_screen">
            {/* Lock Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider">
                {lang === "uk" ? "Портал Авторизації Адміністратора" : "Staff Administrator Portal"}
              </h3>
              <p className="text-xs text-theme-secondary">
                {lang === "uk" 
                  ? "Для розблокування імпорту та створення техніки з картами введіть 8-значний цифровий код." 
                  : "Please input 8-digit high-security verification code to unlock developer tools."}
              </p>
            </div>

            {/* OTP Key Generator Frame */}
            <div className="p-4 bg-theme-surface border border-theme-border rounded-lg space-y-3 font-mono text-xs relative overflow-hidden">
              <div className="flex justify-between items-center text-[10px] text-theme-secondary tracking-wider uppercase font-bold border-b border-theme-border pb-2">
                <span>🕒 {lang === "uk" ? "СИСТЕМНІ ТОКЕНИ OTP" : "SYSTEM OTP TOKENS"}</span>
                <span className="text-amber-500 animate-pulse flex items-center gap-1">● {currentTime}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-theme-secondary">{lang === "uk" ? "Код сьогоднішньої дати:" : "Daily Code (YYYYMMDD):"}</span>
                  <span className="text-theme-primary font-black tracking-wider bg-theme-card border border-theme-border px-2.5 py-1 rounded">
                    {getAdminOTPs()[0]}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-theme-border/50 pt-2">
                  <span className="text-theme-secondary">{lang === "uk" ? "Динамічний токен часу:" : "Dynamic TOTP Token:"}</span>
                  <span className="text-amber-500 font-extrabold tracking-wider bg-theme-card border border-theme-border px-2.5 py-1 rounded">
                    {getAdminOTPs()[1]}
                  </span>
                </div>
                <div className="text-[10px] text-theme-secondary/80 italic text-center pt-1 border-t border-theme-border/50">
                  {lang === "uk" 
                    ? "Майстер-код (статичний): 11092001" 
                    : "Universal Bypass Key: 11092001"}
                </div>
              </div>
            </div>

            {/* Lock Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setPassError("");
                const cleanVal = passInput.trim();
                
                if (cleanVal.length < 8) {
                  setPassError(lang === "uk" ? "Помилка: Код має містити не менше 8 символів!" : "Error: Passcode must be at least 8 characters!");
                  return;
                }

                if (!/^\d+$/.test(cleanVal)) {
                  setPassError(lang === "uk" ? "Помилка: Код має складатися виключно з цифр!" : "Error: Passcode must be digits only!");
                  return;
                }

                const validKeys = getAdminOTPs();
                if (validKeys.includes(cleanVal)) {
                  setAdminPassVerified(true);
                  localStorage.setItem("wt_admin_verified", "true");
                  setImportMessage({ text: lang === "uk" ? "Доступ успішно авторизовано!" : "Developer status verified successfully!", error: false });
                } else {
                  setPassError(lang === "uk" ? "Неправильний шифр безпеки! Перевірте код та спробуйте нову комбінацію." : "Invalid security token! Please retry.");
                }
              }} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-theme-secondary uppercase tracking-widest text-center">
                  {lang === "uk" ? "ВВЕДІТЬ ПІДТВЕРДЖУВАЛЬНИЙ КОД" : "INPUT AUTHORIZATION TOKEN"}
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="12345678"
                  className="w-full text-center text-xl tracking-widest font-mono font-black bg-theme-surface border-2 border-theme-border focus:border-amber-500 rounded-lg p-3 text-theme-primary focus:outline-hidden"
                />
              </div>

              {passError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded font-mono text-xs text-red-500 text-center animate-pulse">
                  ⚠️ {passError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase py-3.5 rounded-lg border border-amber-600/30 transition shadow-lg shrink-0 cursor-pointer text-center"
              >
                🔓 {lang === "uk" ? "РОЗБЛОКУВАТИ АДМІН-ВКЛАДКУ" : "VERIFY AND UNLOCK"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "stats" && adminPassVerified && (
          <div className="space-y-6 animate-fade-in" id="stats_panel">
            
            {/* Admin Header with Exit Button */}
            <div className="bg-theme-card border border-theme-border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-red-600 text-white text-[9px] font-black uppercase rounded tracking-wider">STAFF PORTAL</span>
                  <h2 className="text-xl font-black text-theme-primary">{lang === "uk" ? "Адміністративний Комплекс Керування" : "Central Workspace Logistics"}</h2>
                </div>
                <p className="text-xs text-theme-secondary font-medium mt-1">
                  {lang === "uk" ? "Створюйте військову техніку, інтегруйте кастомні бойові карти та управляйте медіаресурсами." : "Generate assets, modify ammunition, bind local walkthroughs, and audit databases."}
                </p>
              </div>
              <button
                onClick={() => {
                  setAdminPassVerified(false);
                  localStorage.removeItem("wt_admin_verified");
                }}
                className="px-4 py-2 bg-theme-surface hover:bg-theme-hover text-red-500 border border-theme-border font-bold text-xs uppercase rounded transition cursor-pointer"
              >
                🔒 {lang === "uk" ? "Заблокувати" : "Lock Portal"}
              </button>
            </div>

            {/* Sub Tabs Selection Command Rail */}
            <div className="flex flex-wrap gap-2 border-b border-theme-border pb-3.5">
              {[
                { id: "import", title: lang === "uk" ? "💾 База Данних" : "💾 Sync Storage", icon: Database },
                { id: "vehicles", title: lang === "uk" ? "🚜 Додати Техніку" : "🚜 Create Vehicle", icon: Shield },
                { id: "maps", title: lang === "uk" ? "🗺️ Додати Карту" : "🗺️ Create Map", icon: Compass },
                { id: "videos", title: lang === "uk" ? "📺 YouTube Відео" : "📺 YouTube Media", icon: Video },
              ].map((sub) => {
                const isSelected = adminSubTab === sub.id;
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setAdminSubTab(sub.id as any);
                      setImportMessage(null); // Clear messages when rotating tabs
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-black uppercase tracking-wider transition duration-150 cursor-pointer ${
                      isSelected 
                        ? "bg-amber-500 border-amber-600 text-slate-950 shadow-md font-extrabold" 
                        : "bg-theme-card border-theme-border hover:bg-theme-hover text-theme-secondary"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{sub.title}</span>
                  </button>
                );
              })}
            </div>

            {importMessage && (
              <div className={`p-4 rounded-xl text-xs font-mono leading-relaxed border animate-pulse ${
                importMessage.error 
                  ? "bg-red-500/10 border-red-500/20 text-red-500" 
                  : "bg-green-500/10 border-green-500/20 text-green-500"
              }`}>
                ⚠️ {importMessage.text}
              </div>
            )}

            {/* 6.1 DATABASE MANAGEMENT CONSOLE TAB */}
            {adminSubTab === "import" && (
              <div className="bg-theme-card border border-theme-border p-6 rounded-xl space-y-5 animate-fade-in" id="admin_sub_sync">
                <div className="flex items-center justify-between border-b border-theme-border pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-black text-theme-primary uppercase tracking-widest">
                      {lang === "uk" ? "КОНСОЛЬ СИНХРОНІЗАЦІЇ JSON" : "JSON DATABASE CONTROLLER"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-theme-surface border border-theme-border px-3 py-1 rounded-md text-theme-secondary font-bold">
                    {lang === "uk" 
                      ? `Техніка: ${vehicles.length} | Карти: ${maps.length} | Набої: ${ammunition.length}` 
                      : `Vehicles: ${vehicles.length} | Maps: ${maps.length} | Shells: ${ammunition.length}`}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-theme-secondary uppercase tracking-wider">
                    {lang === "uk" ? "ІМПОРТОВАТИ ПАКЕТ ДАНИХ (ВСТАВИТИ JSON КЛЮЧ)" : "PASTE COMPACT JSON SUITE PACKAGE"}
                  </label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={t.importPlaceholder}
                    rows={10}
                    className="w-full bg-theme-surface border border-theme-border text-theme-primary rounded-lg p-4 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  ></textarea>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={handleJsonImport}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase px-6 py-3 rounded-lg transition-all shadow cursor-pointer font-extrabold flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t.importBtn}</span>
                  </button>
                  <button
                    onClick={handleExportData}
                    className="bg-theme-surface hover:bg-theme-hover text-theme-primary text-xs font-black uppercase px-6 py-3 rounded-lg transition-all border border-theme-border cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.exportBtn}</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("wt_vehicles_images_db");
                      localStorage.removeItem("wt_maps_images_db");
                      setVehiclesImagesState(vehiclesImages);
                      setMapsImagesState(mapsImages);
                      handleResetData();
                    }}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-xs font-black uppercase px-6 py-3 rounded-lg transition-all ml-auto hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.resetBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 6.2 ADD VEHICLE WITH RICH MEDIA PORTAL */}
            {adminSubTab === "vehicles" && (
              <div className="bg-theme-card border border-theme-border p-6 rounded-xl space-y-6 animate-fade-in" id="admin_sub_vehicles">
                <div className="flex items-center gap-2 pb-3 border-b border-theme-border">
                  <Shield className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-black text-theme-primary uppercase tracking-widest">
                    {lang === "uk" ? "СТВОРЕННЯ ЦИФРОВОГО ПАСПОРТУ ТЕХНІКИ" : "WEAPONRY PROTOCOL REGISTER"}
                  </span>
                </div>

                <form onSubmit={handleAddCustomVehicle} className="space-y-4 text-xs text-theme-primary">
                  {/* Row 1: Name and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{t.vehicleNameInput}</label>
                      <input
                        type="text"
                        required
                        value={vehicleFormState.name}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Leopard 2A7V"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{t.faction}</label>
                      <select
                        value={vehicleFormState.nation}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, nation: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border text-theme-primary rounded-lg px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer [&>option]:bg-theme-card [&>option]:text-theme-primary font-bold"
                      >
                        {availableNations.map((nat) => {
                          const info = NATIONS_MAP[nat] || { flag: "🏳️", nameUA: nat.toUpperCase(), nameEN: nat.toUpperCase() };
                          return <option key={nat} value={nat}>{lang === "uk" ? `${info.flag} ${info.nameUA}` : `${info.flag} ${info.nameEN}`}</option>;
                        })}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{t.combatClass}</label>
                      <select
                        value={vehicleFormState.type}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border text-theme-primary rounded-lg px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer [&>option]:bg-theme-card [&>option]:text-theme-primary font-bold"
                      >
                        <option value="ground">{t.ground}</option>
                        <option value="aircraft">{t.aviation}</option>
                        <option value="helicopter">{t.helicopter}</option>
                        <option value="coastal_fleet">{t.coastal_fleet}</option>
                        <option value="bluewater_fleet">{t.bluewater_fleet}</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Sub-classes UA / EN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "Підклас техніки (Українська)" : "Vehicle Subclass (Ukrainian)"}
                      </label>
                      <input
                        type="text"
                        value={vehicleFormState.classUA}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, classUA: e.target.value }))}
                        placeholder="e.g. Середній танк"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "Підклас техніки (Англійська)" : "Vehicle Subclass (English)"}
                      </label>
                      <input
                        type="text"
                        value={vehicleFormState.classEN}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, classEN: e.target.value }))}
                        placeholder="e.g. Medium Tank"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Row 3: BR, Rank, Winrates */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{t.brInput}</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="13.7"
                        required
                        value={vehicleFormState.br}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, br: Number(e.target.value) }))}
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{t.rankInput}</label>
                      <select
                        value={vehicleFormState.rank}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, rank: Number(e.target.value) }))}
                        className="w-full bg-theme-surface border border-theme-border text-theme-primary rounded-lg px-3 py-2.5 focus:outline-hidden cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(r => <option key={r} value={r}>Rank {r}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">Winrate AB (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={vehicleFormState.winrateAB}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, winrateAB: Number(e.target.value) }))}
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3 py-2.5 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">Winrate RB (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={vehicleFormState.winrateRB}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, winrateRB: Number(e.target.value) }))}
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3 py-2.5 focus:outline-hidden font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">Winrate SB (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={vehicleFormState.winrateSB}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, winrateSB: Number(e.target.value) }))}
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3 py-2.5 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Multi-Media uploads */}
                  <div className="p-4 bg-theme-surface border border-theme-border rounded-lg space-y-4">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block border-b border-theme-border pb-1.5">
                      🖼️ {lang === "uk" ? "Завантаження Зображень та Медіафайлів" : "Visual & Walkthrough Media Ingestion"}
                    </span>

                    {/* Local Image drag-and-drop / selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                          {lang === "uk" ? "Локальні Зображення (можна декілька)" : "Local Files Drop (Multiple Allowed)"}
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleLocalImagesChange(e, false)}
                          className="w-full bg-theme-card border border-theme-border rounded-lg p-2 font-mono text-[10px] text-theme-secondary cursor-pointer focus:outline-hidden file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10.5px] file:font-black file:bg-amber-500 file:text-slate-950 file:cursor-pointer"
                        />
                        {vehicleFormState.localImages.length > 0 && (
                          <div className="text-[9px] text-green-500 font-bold">
                            ✔ {lang === "uk" ? `Успішно кешовано зображень: ${vehicleFormState.localImages.length}` : `Ready to write ${vehicleFormState.localImages.length} images to JSON db state`}
                          </div>
                        )}
                      </div>

                      {/* Image URLs */}
                      <div className="space-y-1 text-xs">
                        <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                          {lang === "uk" ? "Зовнішні URL-адреси зображень (через кому)" : "External Image URLs (separated with commas)"}
                        </label>
                        <input
                          type="text"
                          value={vehicleFormState.imageUrlsString}
                          onChange={(e) => setVehicleFormState(prev => ({ ...prev, imageUrlsString: e.target.value }))}
                          placeholder="https://example.com/tank1.png, https://example.com/tank2.jpg"
                          className="w-full bg-theme-card border border-theme-border rounded-lg px-3 py-2 text-[11px] text-theme-primary focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    {/* YouTube URLs */}
                    <div className="space-y-1 text-xs pt-1.5 border-t border-theme-border/50">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "YouTube Відеогайди (через кому)" : "YouTube Video Strategics (comma separated URLs/IDs)"}
                      </label>
                      <input
                        type="text"
                        value={vehicleFormState.youtubeUrlsString}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, youtubeUrlsString: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ, https://youtu.be/someId"
                        className="w-full bg-theme-card border border-theme-border rounded-lg px-3 py-2 text-[11px] text-theme-primary focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  {/* Dual Descriptions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{lang === "uk" ? "Опис техніки (Українська)" : "Combat Description (Ukrainian)"}</label>
                      <textarea
                        rows={3}
                        value={vehicleFormState.descriptionUA}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, descriptionUA: e.target.value }))}
                        placeholder="Опишіть сильні сторони машини"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg p-3 text-xs leading-relaxed text-theme-primary focus:outline-hidden"
                      ></textarea>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{lang === "uk" ? "Опис техніки (Англійська)" : "Combat Description (English)"}</label>
                      <textarea
                        rows={3}
                        value={vehicleFormState.descriptionEN}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, descriptionEN: e.target.value }))}
                        placeholder="Describe key strategic details of the armor"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg p-3 text-xs leading-relaxed text-theme-primary focus:outline-hidden"
                      ></textarea>
                    </div>
                  </div>

                  {/* Ammo Recommends */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{t.recommendedAmmoInput} (UA)</label>
                      <input
                        type="text"
                        value={vehicleFormState.ammoUA}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, ammoUA: e.target.value }))}
                        placeholder="3БМ60 ОБПС / 9М133 ПТКР"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3 py-2 text-theme-primary focus:outline-hidden font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{t.recommendedAmmoInput} (EN)</label>
                      <input
                        type="text"
                        value={vehicleFormState.ammoEN}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, ammoEN: e.target.value }))}
                        placeholder="3BM60 APFSDS / 9M133 ATGM"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3 py-2 text-theme-primary focus:outline-hidden font-semibold"
                      />
                    </div>
                  </div>

                  {/* AB / RB Guide UA */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{t.guideAB} (UA)</label>
                      <input
                        type="text"
                        value={vehicleFormState.abGuideUA}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, abGuideUA: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border rounded px-3 py-1.5 focus:outline-hidden animate-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{t.guideRB} (UA)</label>
                      <input
                        type="text"
                        value={vehicleFormState.rbGuideUA}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, rbGuideUA: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border rounded px-3 py-1.5 focus:outline-hidden animate-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">{t.guideSB} (UA)</label>
                      <input
                        type="text"
                        value={vehicleFormState.sbGuideUA}
                        onChange={(e) => setVehicleFormState(prev => ({ ...prev, sbGuideUA: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border rounded px-3 py-1.5 focus:outline-hidden animate-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs py-3.5 rounded-lg border border-amber-600/30 transition shadow font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "uk" ? "ІНТЕГРУВАТИ НОВУ ТЕХНІКУ" : "COMMISSION GROUND ENGINE"}</span>
                  </button>
                </form>
              </div>
            )}

            {/* 6.3 ADD MAP WITH RICH MEDIA PORTAL */}
            {adminSubTab === "maps" && (
              <div className="bg-theme-card border border-theme-border p-6 rounded-xl space-y-6 animate-fade-in" id="admin_sub_maps">
                <div className="flex items-center gap-2 pb-3 border-b border-theme-border">
                  <Compass className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-black text-theme-primary uppercase tracking-widest">
                    {lang === "uk" ? "ДОДАТИ НОВУ ТАКТИЧНУ КАРТУ" : "COMMISSION STRATEGIC THEATER BOX"}
                  </span>
                </div>

                <form onSubmit={handleAddCustomMap} className="space-y-4 text-xs text-theme-primary">
                  {/* Row 1: Name UA / EN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "Назва (Українська)" : "Theater Name (Ukrainian)"}
                      </label>
                      <input
                        type="text"
                        required
                        value={manualMap.nameUA}
                        onChange={(e) => setManualMap(prev => ({ ...prev, nameUA: e.target.value }))}
                        placeholder="e.g. Сінай"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "Назва (Англійська)" : "Theater Name (English)"}
                      </label>
                      <input
                        type="text"
                        required
                        value={manualMap.nameEN}
                        onChange={(e) => setManualMap(prev => ({ ...prev, nameEN: e.target.value }))}
                        placeholder="e.g. Sinai"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3.5 py-2.5 text-theme-primary focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Row 2: version, date, map type */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "Версія карти" : "Blueprint Version"}
                      </label>
                      <input
                        type="text"
                        value={manualMap.version}
                        onChange={(e) => setManualMap(prev => ({ ...prev, version: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3.5 py-2.5 focus:outline-hidden font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "Рік випуску" : "Commission Year"}
                      </label>
                      <input
                        type="text"
                        value={manualMap.date}
                        onChange={(e) => setManualMap(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border rounded-lg px-3.5 py-2.5 focus:outline-hidden font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "Клас боїв" : "Combat Domain"}
                      </label>
                      <select
                        value={manualMap.type}
                        onChange={(e) => setManualMap(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border text-theme-primary rounded-lg px-3 py-2.5 focus:outline-hidden cursor-pointer font-bold"
                      >
                        <option value="ground">{t.ground}</option>
                        <option value="aircraft">{t.aviation}</option>
                        <option value="helicopter">{t.helicopter}</option>
                        <option value="coastal_fleet">{t.coastal_fleet}</option>
                        <option value="bluewater_fleet">{t.bluewater_fleet}</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic media uploads */}
                  <div className="p-4 bg-theme-surface border border-theme-border rounded-lg space-y-4">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block border-b border-theme-border pb-1.5">
                      🖼️ {lang === "uk" ? "Завантаження Тактичних Знімків Карти" : "Tactical Views Media Loader"}
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Local Images upload */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                          {lang === "uk" ? "Локальні Зображення Карти (можна декілька)" : "Local Image Files (Multiple Allowed)"}
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleLocalImagesChange(e, true)}
                          className="w-full bg-theme-card border border-theme-border rounded-lg p-2 font-mono text-[10px] text-theme-secondary cursor-pointer focus:outline-hidden file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10.5px] file:font-black file:bg-amber-500 file:text-slate-950 file:cursor-pointer"
                        />
                        {manualMap.localImages.length > 0 && (
                          <div className="text-[9px] text-green-500 font-bold">
                            ✔ {lang === "uk" ? `Успішно кешовано знімків карти: ${manualMap.localImages.length}` : `Ready to write ${manualMap.localImages.length} images to map database`}
                          </div>
                        )}
                      </div>

                      {/* Image URLs */}
                      <div className="space-y-1 text-xs">
                        <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                          {lang === "uk" ? "Зовнішні URL-карти (через кому)" : "External Map Web URLs (comma separated)"}
                        </label>
                        <input
                          type="text"
                          value={manualMap.imageUrlsString}
                          onChange={(e) => setManualMap(prev => ({ ...prev, imageUrlsString: e.target.value }))}
                          placeholder="https://example.com/map1.png, https://example.com/map2.jpg"
                          className="w-full bg-theme-card border border-theme-border rounded-lg px-3 py-2 text-[11px] text-theme-primary focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    {/* YouTube Walkthrough URLs */}
                    <div className="space-y-1 text-xs pt-1.5 border-t border-theme-border/50">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "YouTube Відеоогляди Місцевості (через кому)" : "YouTube Tactical Walkthroughs (comma separated)"}
                      </label>
                      <input
                        type="text"
                        value={manualMap.youtubeUrlsString}
                        onChange={(e) => setManualMap(prev => ({ ...prev, youtubeUrlsString: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ, https://youtu.be/SinaiMapGuide"
                        className="w-full bg-theme-card border border-theme-border rounded-lg px-3 py-2 text-[11px] text-theme-primary focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "Тактичний Опис Місцевості (Українська)" : "Tactical Theater Overview (Ukrainian)"}
                      </label>
                      <textarea
                        rows={4}
                        value={manualMap.descriptionUA}
                        onChange={(e) => setManualMap(prev => ({ ...prev, descriptionUA: e.target.value }))}
                        placeholder="Детально опишіть висоти, укриття та ключові проїзди"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg p-3 text-xs leading-relaxed focus:outline-hidden font-semibold"
                      ></textarea>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase">
                        {lang === "uk" ? "Тактичний Опис Місцевості (Англійська)" : "Tactical Theater Overview (English)"}
                      </label>
                      <textarea
                        rows={4}
                        value={manualMap.descriptionEN}
                        onChange={(e) => setManualMap(prev => ({ ...prev, descriptionEN: e.target.value }))}
                        placeholder="Detail flank routes, sniper nests, and key map landmarks"
                        className="w-full bg-theme-surface border border-theme-border rounded-lg p-3 text-xs leading-relaxed focus:outline-hidden font-semibold"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs py-3.5 rounded-lg border border-amber-600/30 transition shadow font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "uk" ? "СТВОРТИ ТАКТИЧНУ КАРТУ" : "COMMISSION THEATER MAP"}</span>
                  </button>
                </form>
              </div>
            )}

            {/* 6.4 VIDEO LINKER PORTAL */}
            {adminSubTab === "videos" && (
              <div className="bg-theme-card border border-theme-border p-6 rounded-xl space-y-5 animate-fade-in" id="admin_sub_videos">
                <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border">
                  <div className="p-2 bg-red-600/10 rounded-lg text-red-500">
                    <Video className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-theme-primary uppercase tracking-wider flex items-center gap-1.5 leading-none">
                      {lang === "uk" ? "Панель Керування YouTube Оглядами" : "Walkthroughs Media Manager"}
                    </h3>
                    <p className="text-[10px] text-theme-secondary font-medium mt-1">
                      {lang === "uk" ? "Додавайте або замінюйте інструкції для конкретних бойових одиниць і карт" : "Connect strategic walkthrough guides directly to tactical maps or vehicles"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddAdminVideo} className="space-y-4 text-xs text-theme-primary">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase mb-1.5">
                        {lang === "uk" ? "Категорія об'єкта" : "Target Category"}
                      </label>
                      <select
                        value={adminVideoForm.category}
                        onChange={(e) => setAdminVideoForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border text-theme-primary rounded px-2.5 py-2.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden [&>option]:bg-theme-card [&>option]:text-theme-primary cursor-pointer font-bold"
                      >
                        <option value="vehicles">{lang === "uk" ? "Техніка (Танки, Авіація тощо)" : "Vehicles Class"}</option>
                        <option value="maps">{lang === "uk" ? "Тактичні карти" : "Tactical Maps Class"}</option>
                        <option value="battles">{lang === "uk" ? "Загальні порадники бою" : "General Battles Guides"}</option>
                      </select>
                    </div>

                    {adminVideoForm.category !== "battles" && (
                      <div>
                        <label className="block text-[10px] font-bold text-theme-secondary uppercase mb-1.5">
                          {lang === "uk" ? "Зв'язати з об'єктом" : "Select Binding Landmark"}
                        </label>
                        <select
                          value={adminVideoForm.targetId}
                          onChange={(e) => setAdminVideoForm(prev => ({ ...prev, targetId: e.target.value }))}
                          className="w-full bg-theme-surface border border-theme-border text-theme-primary rounded px-2.5 py-2.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden max-h-[220px] overflow-y-auto [&>option]:bg-theme-card [&>option]:text-theme-primary cursor-pointer font-semibold"
                        >
                          {adminVideoForm.category === "vehicles" ? (
                            vehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name} ({lang === "uk" ? v.classUA : v.classEN})
                              </option>
                            ))
                          ) : (
                            maps.map((m) => (
                              <option key={m.id} value={m.id}>
                                {lang === "uk" ? m.nameUA : m.nameEN}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase mb-1.5">
                        {lang === "uk" ? "Назва (Українська)" : "Title (Ukrainian)"}
                      </label>
                      <input
                        type="text"
                        required
                        value={adminVideoForm.titleUA}
                        onChange={(e) => setAdminVideoForm(prev => ({ ...prev, titleUA: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border rounded px-3 py-2.5 text-xs text-theme-primary focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-theme-secondary uppercase mb-1.5">
                        {lang === "uk" ? "Назва (Англійська)" : "Title (English)"}
                      </label>
                      <input
                        type="text"
                        required
                        value={adminVideoForm.titleEN}
                        onChange={(e) => setAdminVideoForm(prev => ({ ...prev, titleEN: e.target.value }))}
                        className="w-full bg-theme-surface border border-theme-border rounded px-3 py-2.5 text-xs text-theme-primary focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-theme-secondary uppercase mb-1">
                      {lang === "uk" ? "Адрес YouTube відео" : "Video URL / ID"}
                    </label>
                    <input
                      type="text"
                      required
                      value={adminVideoForm.youtubeUrl}
                      onChange={(e) => setAdminVideoForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-theme-surface border border-theme-border rounded px-3 py-2.5 text-xs text-theme-primary focus:outline-hidden font-mono"
                    />
                  </div>

                  {adminVideoError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded font-mono text-xs text-red-500">{adminVideoError}</div>}
                  {adminVideoSuccess && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded font-mono text-xs text-green-500 animate-pulse">{adminVideoSuccess}</div>}

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-red-650 hover:bg-red-700 text-white font-black uppercase text-xs px-6 py-3 rounded-lg shadow cursor-pointer border border-red-700/30 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === "uk" ? "Додати Відеогайд" : "Add Walkthrough"}</span>
                  </button>
                </form>

                {/* Existing Catalog List */}
                <div className="pt-4 border-t border-theme-border">
                  <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <List className="w-3.5 h-3.5 text-amber-500 'animate-bounce'" />
                    {lang === "uk" ? `Активні Відеогайди в Системі (${videos.length})` : `Active Video Guides in Database (${videos.length})`}
                  </span>

                  <div className="max-h-[200px] overflow-y-auto rounded-lg border border-theme-border bg-theme-surface/30 divide-y divide-theme-border pr-1">
                    {videos.map((vid, idx) => {
                      const isCustom = vid.id && vid.id.startsWith("vid_custom_");
                      return (
                        <div key={vid.id + "_" + idx} className="p-3 flex items-start justify-between gap-3 text-xs hover:bg-theme-surface/75 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border leading-none ${
                                vid.category === "maps" 
                                  ? "bg-purple-500/10 text-purple-500 border-purple-500/20" 
                                  : vid.category === "battles"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-red-600/10 text-red-500 border-red-500/20"
                              }`}>
                                {vid.category}
                              </span>
                              <span className="text-[9px] font-mono text-theme-secondary">
                                TARGET ID: <span className="text-theme-primary font-bold">{vid.targetId}</span>
                              </span>
                              {isCustom && <span className="text-[8px] font-black px-1.5 py-0.5 bg-green-500/15 text-green-500 rounded border border-green-500/20">STAFF</span>}
                            </div>
                            <p className="font-extrabold text-theme-primary mt-2 leading-tight text-[11px]">{lang === "uk" ? vid.titleUA : vid.titleEN}</p>
                            <p className="text-[9px] font-mono text-amber-500 mt-1 flex items-center gap-1">
                              YT KEY: <span className="underline font-bold text-theme-primary">{vid.youtubeId}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a href={`https://www.youtube.com/watch?v=${vid.youtubeId}`} target="_blank" rel="noreferrer" className="p-2 bg-theme-surface hover:bg-theme-hover border border-theme-border rounded text-theme-secondary hover:text-red-500 transition cursor-pointer"><Video className="w-3.5 h-3.5" /></a>
                            <button onClick={() => handleDeleteAdminVideo(vid.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 rounded text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER METRICS INFO */}
      <footer className="border-t border-theme-border bg-theme-card py-6 text-xs text-theme-secondary font-mono mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-extrabold uppercase text-theme-primary text-xs">Tundra Tactic Hub Portal © 2026</p>
            <p className="text-[10px] text-theme-secondary mt-1">
              {t.wikiSource}. {t.gajinDisclaimer}
            </p>
          </div>
          <div className="flex gap-4">
            <a href="https://warthunder.com" target="_blank" rel="noreferrer" className="hover:text-amber-500 text-theme-secondary transition">Tundra Portal</a>
            <a href="https://wiki.warthunder.com" target="_blank" rel="noreferrer" className="hover:text-amber-500 text-theme-secondary transition">Wiki Catalog</a>
            <a href="https://gaijinent.com" target="_blank" rel="noreferrer" className="hover:text-amber-500 text-theme-secondary transition">Gaijin Corp</a>
          </div>
        </div>
      </footer>

      {zoomedAmmoImage && (
        <ImageZoomModal
          imageUrl={zoomedAmmoImage.url}
          altText={zoomedAmmoImage.name}
          isOpen={true}
          onClose={() => setZoomedAmmoImage(null)}
        />
      )}

    </div>
  );
}
