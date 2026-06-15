export interface FlankingRoute {
  id: string;
  nameUA: string;
  nameEN: string;
  points: { x: number; y: number }[]; // percentage coordinates [0..100]
  descUA?: string;
  descEN?: string;
}

export interface HeatmapZone {
  x: number; // percentage [0..100]
  y: number; // percentage [0..100]
  radius: number; // radius in meters
  intensity: number; // value from 1 to 100 for battle density
  labelUA: string;
  labelEN: string;
}

export interface MapSpecs {
  mapSize: number;      // total size of map imagery in meters (e.g. 4000)
  activeSize: number;   // active playable zone in meters (e.g. 1600 or 4000)
  gridCols: number;     // horizontal letter subdivisions (usually 10 for 1..10)
  gridRows: number;     // vertical subdivisions (9 or 10 or 8)
  imageUrl: string;     // direct static URL to real War Thunder map
  flankingRoutes: FlankingRoute[];
  heatmapZones: HeatmapZone[];
}

export const WAR_THUNDER_MAPS_SPECS: Record<string, MapSpecs> = {
  kuban: {
    mapSize: 1600,
    activeSize: 1600,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Kuban%20-%20Krymsk.webp",
    flankingRoutes: [
      {
        id: "route_north_cliff",
        nameUA: "Обхід північного хребта",
        nameEN: "Northern Ridge Flank",
        points: [{ x: 15, y: 80 }, { x: 22, y: 18 }, { x: 42, y: 22 }, { x: 85, y: 20 }],
        descUA: "Прихований шлях по північній кромці скель, убезпечений від прямих пострілів із центральної ущелини.",
        descEN: "Sheltered road covering the far north cliff edge, safe from direct fire columns originating in the central gorge."
      },
      {
        id: "route_south_lake",
        nameUA: "Південний маневр біля озера",
        nameEN: "Southern Lake Assault",
        points: [{ x: 15, y: 80 }, { x: 50, y: 85 }, { x: 70, y: 65 }, { x: 85, y: 20 }],
        descUA: "Маневр вздовж водойми через південні лісосмуги для захоплення точки C.",
        descEN: "Speedy flank running near the southern lake borders, allowing unexpected attacks on point C."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 250, intensity: 95, labelUA: "Центральна Ущелина", labelEN: "Gorge Crucible" },
      { x: 42, y: 22, radius: 180, intensity: 80, labelUA: "Пагорб біля Замку", labelEN: "Castle Overlook" },
      { x: 70, y: 65, radius: 150, intensity: 65, labelUA: "Зона Гірського Озера", labelEN: "Lake Shore Brawls" }
    ]
  },
  kursk: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Kursk%20-%20Red%20October.webp",
    flankingRoutes: [
      {
        id: "route_west_forest",
        nameUA: "Західний лісовий пробіг",
        nameEN: "Western Forest Bypass",
        points: [{ x: 50, y: 90 }, { x: 18, y: 65 }, { x: 15, y: 45 }, { x: 50, y: 10 }],
        descUA: "Широкий обхід по лівому флангу через густий березовий гай для придушення снайперів.",
        descEN: "Very wide flank utilizing dense birch grove trees for close-quarters surprise maneuvers."
      },
      {
        id: "route_east_pasture",
        nameUA: "Східні поля фільтрації",
        nameEN: "Eastern Pasture Rush",
        points: [{ x: 50, y: 90 }, { x: 82, y: 60 }, { x: 85, y: 40 }, { x: 50, y: 10 }],
        descUA: "Швидкісний кидок вздовж правого обрію. Заборонено зупинятися через огляд ворога.",
        descEN: "High-speed line running of the eastern plains. Halt is strictly fatal due to clear overlook."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 450, intensity: 98, labelUA: "Селище Красний Октябрь (Точка B)", labelEN: "Village Center (B)" },
      { x: 25, y: 50, radius: 320, intensity: 75, labelUA: "Старий Цвинтар (Точка A)", labelEN: "Cemetery Outskirts (A)" },
      { x: 75, y: 52, radius: 300, intensity: 60, labelUA: "Східне Перехрестя", labelEN: "Eastern Junction (C)" }
    ]
  },
  mozdok: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 9,
    imageUrl: "/Mozdok%20-%20Bratskoe.webp",
    flankingRoutes: [
      {
        id: "route_river_low",
        nameUA: "Нижній обхід русла річки",
        nameEN: "Riverbed Lowland Flank",
        points: [{ x: 15, y: 80 }, { x: 45, y: 78 }, { x: 75, y: 82 }, { x: 88, y: 80 }],
        descUA: "Заглиблення біля висохлого русла забезпечує захист кузовів від снайперів з пагорбів.",
        descEN: "Dry river depression shields Hull down positions against lookouts resting atop high hills."
      }
    ],
    heatmapZones: [
      { x: 30, y: 40, radius: 380, intensity: 90, labelUA: "Пагорби Точки A", labelEN: "Hill A Struggles" },
      { x: 50, y: 50, radius: 400, intensity: 85, labelUA: "Центральна Низина", labelEN: "Central Meadows" }
    ]
  },
  hurtgen: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Hurtgen%20Forest%20-%20Vossenack.webp",
    flankingRoutes: [
      {
        id: "route_hurtgen_south",
        nameUA: "Південна лісова ущелина",
        nameEN: "Southern Ravine Bypass",
        points: [{ x: 15, y: 85 }, { x: 50, y: 92 }, { x: 85, y: 85 }],
        descUA: "Глибинне обходження вздовж крайньої гряди пагорбів у нижньому лісі.",
        descEN: "Deep forest flank skirting the far southern ridges under heavy vegetation cover."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 350, intensity: 90, labelUA: "Руїни містечка (B)", labelEN: "Hurtgen Ruined Square" }
    ]
  },
  berlin: {
    mapSize: 2000,
    activeSize: 2000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Berlin%20-%20Konigsplatz.webp",
    flankingRoutes: [
      {
        id: "route_reichstag_tunnel",
        nameUA: "Західні руїни та Бранденбурзькі ворота",
        nameEN: "Brandenburg Gate Slip",
        points: [{ x: 15, y: 80 }, { x: 15, y: 50 }, { x: 45, y: 15 }, { x: 85, y: 20 }],
        descUA: "Вуличний кидок крізь зруйновані будівлі біля Бранденбурзьких воріт.",
        descEN: "Fast street combat line clearing gates and Reichstag ruins with immediate corner coverage."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 180, intensity: 92, labelUA: "Центральний рів перед Рейхстагом", labelEN: "Reichstag Plaza Area" }
    ]
  },
  normandy: {
    mapSize: 4000,
    activeSize: 3000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Normandy%20-%20Omaha%20Beach.webp",
    flankingRoutes: [
      {
        id: "route_beach_run",
        nameUA: "Морська штурмова смуга",
        nameEN: "Shoreline Beach Assualt",
        points: [{ x: 15, y: 20 }, { x: 50, y: 18 }, { x: 85, y: 20 }],
        descUA: "Спринт по воді під обривом пляжу. Ризиковано, але повністю обходить місто.",
        descEN: "Wet sand sprint bypassing coastal town streets, easily locked down by beach defense."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 300, intensity: 90, labelUA: "Церква та площі", labelEN: "Village Cathedral" }
    ]
  },
  finland: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Finland%20-%20Yasnoe%20Lake.webp",
    flankingRoutes: [
      {
        id: "route_frozen_lake",
        nameUA: "Прорив крижаним морем",
        nameEN: "Frozen Bay Penetration",
        points: [{ x: 15, y: 80 }, { x: 50, y: 85 }, { x: 85, y: 80 }],
        descUA: "Небезпечний прохід по льоду фіорду. Практично відсутні укриття, окрім айсбергів.",
        descEN: "Unsheltered ice shelf drag. Maximum speed and heavy smokes are recommended."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 250, intensity: 88, labelUA: "Бункери на скелі B", labelEN: "Mountain Pass B" }
    ]
  },
  rhine: {
    mapSize: 1000,
    activeSize: 1000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Advance%20to%20the%20Rhine%20-%20Cologne.webp",
    flankingRoutes: [
      {
        id: "route_river_avenue",
        nameUA: "Західні проспекти біля Рейну",
        nameEN: "Rhine Embankment Flank",
        points: [{ x: 15, y: 85 }, { x: 15, y: 50 }, { x: 15, y: 15 }],
        descUA: "Обхідна колія вздовж набережної річки. Прямий фланг без зайвих перехресть.",
        descEN: "Straight asphalt run flanking alongside the concrete river borders; excellent for quick heavy tanks."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 100, intensity: 97, labelUA: "Центральна Зруйнована Площа", labelEN: "Square Center (Cap B)" },
      { x: 25, y: 30, radius: 90, intensity: 85, labelUA: "Залізничний роз'їзд (Cap A)", labelEN: "Railway Junction (Cap A)" }
    ]
  },
  stalingrad: {
    mapSize: 2000,
    activeSize: 2000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Stalingrad%20-%20Tractor%20Factory.webp",
    flankingRoutes: [],
    heatmapZones: [
      { x: 50, y: 50, radius: 200, intensity: 93, labelUA: "Тракторний Завод", labelEN: "Factory Floor Brawling" }
    ]
  },
  elalamein: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Second%20Battle%20of%20El%20Alamein.webp",
    flankingRoutes: [
      {
        id: "route_desert_dune",
        nameUA: "Дахабські Дюни",
        nameEN: "Dahab Oasis Sweep",
        points: [{ x: 15, y: 80 }, { x: 45, y: 85 }, { x: 85, y: 80 }],
        descUA: "Далекий маневр крізь високі дюни на крайньому південному Сході.",
        descEN: "Vast southern desert route. High speed light vehicles can run circles here."
      }
    ],
    heatmapZones: [
      { x: 50, y: 35, radius: 300, intensity: 87, labelUA: "Руїни На Залізниці", labelEN: "Oasis Rails (Cap B)" }
    ]
  },
  tunis: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Tunisia%20-%20Akarit.webp",
    flankingRoutes: [],
    heatmapZones: [
      { x: 30, y: 50, radius: 300, intensity: 88, labelUA: "Кам'яний Міст", labelEN: "Bridge Chokepoint" }
    ]
  },
  volokolamsk: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Volokolamsk%20-%20Nelidovo.webp",
    flankingRoutes: [],
    heatmapZones: [
      { x: 50, y: 50, radius: 350, intensity: 81, labelUA: "Станція Волоколамськ", labelEN: "Railway Station" }
    ]
  },
  novorossiysk: {
    mapSize: 2000,
    activeSize: 2000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Port%20Novorossiysk.webp",
    flankingRoutes: [],
    heatmapZones: [
      { x: 50, y: 50, radius: 180, intensity: 90, labelUA: "Парк Свободи", labelEN: "War-Torn Coastal Strip" }
    ]
  },
  sinai: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Sinai%20-%20Suez%20Canal.webp",
    flankingRoutes: [
      {
        id: "route_sinai_east",
        nameUA: "Східні Скелі",
        nameEN: "Eastern Spires Flank",
        points: [{ x: 85, y: 80 }, { x: 88, y: 50 }, { x: 85, y: 20 }],
        descUA: "Сховане просування за великими скелями вздовж правого краю.",
        descEN: "Excellent cover from desert sniping by hiding behind eastern sandstone clusters."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 350, intensity: 91, labelUA: "Червона Долина", labelEN: "Valley Center" }
    ]
  },
  abandoned_factory: {
    mapSize: 2000,
    activeSize: 2000,
    gridCols: 10,
    gridRows: 9,
    imageUrl: "/Abandoned%20Factory.webp",
    flankingRoutes: [
      {
        id: "route_factory_rail",
        nameUA: "Залізничний тупик",
        nameEN: "Scrap Yard Rails",
        points: [{ x: 15, y: 80 }, { x: 18, y: 45 }, { x: 15, y: 15 }],
        descUA: "Шлях за вантажними вагонами на західній стороні заводу.",
        descEN: "Sneaking through cargo trains on the western side of the factory. Heavy cover."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 180, intensity: 94, labelUA: "Сталепрокатне відділення", labelEN: "Furnace Hall (Cap B)" }
    ]
  },
  ardennes: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Ardennes%20-%20Bastogne.webp",
    flankingRoutes: [],
    heatmapZones: [
      { x: 45, y: 45, radius: 320, intensity: 89, labelUA: "Площа Бастоні", labelEN: "Bastogne Square" }
    ]
  },
  fulda: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Fulda%20Gap%20-%20Point%20Alpha.webp",
    flankingRoutes: [
      {
        id: "route_cold_war_gap",
        nameUA: "Траса Західної Німеччини",
        nameEN: "Cold War Highway Flank",
        points: [{ x: 10, y: 80 }, { x: 12, y: 45 }, { x: 10, y: 15 }],
        descUA: "Прорив вздовж головної автостради через густі ялини.",
        descEN: "Sprinting down the highway on the western border. Extreme distances."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 450, intensity: 90, labelUA: "Замок та вітряки", labelEN: "Chateau Engagement Hub" }
    ]
  },
  maginot: {
    mapSize: 4000,
    activeSize: 4000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Maginot%20Line%20-%20Sedan.webp",
    flankingRoutes: [],
    heatmapZones: [
      { x: 50, y: 50, radius: 300, intensity: 86, labelUA: "Форти Мажино", labelEN: "Maginot Blockhouses" }
    ]
  },
  italy: {
    mapSize: 3000,
    activeSize: 3000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Italy%20-%20Campania.webp",
    flankingRoutes: [],
    heatmapZones: [
      { x: 50, y: 50, radius: 220, intensity: 87, labelUA: "Вілла Боргезе", labelEN: "Cathedral Piazza B" }
    ]
  },
  breslau: {
    mapSize: 2000,
    activeSize: 2000,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Breslau%20-%20Wroclaw.webp",
    flankingRoutes: [],
    heatmapZones: [
      { x: 50, y: 50, radius: 150, intensity: 94, labelUA: "Оперна площа", labelEN: "Opera Street Crossfire" }
    ]
  },
  abandoned_city: {
    mapSize: 2500,
    activeSize: 2500,
    gridCols: 10,
    gridRows: 10,
    imageUrl: "/Abandoned%20City%20-%20Tkvarchreli.webp",
    flankingRoutes: [
      {
        id: "route_city_freeway",
        nameUA: "Порожня розв'язка шосе",
        nameEN: "Overhead Freeway Sweep",
        points: [{ x: 80, y: 80 }, { x: 85, y: 50 }, { x: 80, y: 20 }],
        descUA: "Маневр вздовж швидкісної магістралі по східній частині промислових будівель.",
        descEN: "Running the bypass lane on the outskirts with elevated sniper viewpoints."
      }
    ],
    heatmapZones: [
      { x: 50, y: 50, radius: 200, intensity: 93, labelUA: "Закинутий Торговий Центр", labelEN: "Central Terminal Mall (Cap B)" }
    ]
  }
};

/**
 * Calculates distance in meters between two percent-based positions.
 */
export function calculateRealDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  mapSizeMeters: number
): number {
  const dx = ((p2.x - p1.x) / 100) * mapSizeMeters;
  const dy = ((p2.y - p1.y) / 100) * mapSizeMeters;
  return Math.sqrt(dx * dx + dy * dy);
}
