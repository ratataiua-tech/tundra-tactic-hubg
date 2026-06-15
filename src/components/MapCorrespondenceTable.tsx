import React from "react";
import { Compass } from "lucide-react";

interface MapItem {
  id: string;
  nameUA: string;
  nameEN: string;
}

interface MapCorrespondenceTableProps {
  lang: string;
  currentMap: MapItem;
  maps: MapItem[];
  localMapMapping: Record<string, string>;
}

export const MapCorrespondenceTable: React.FC<MapCorrespondenceTableProps> = ({
  lang,
  currentMap,
  maps,
  localMapMapping,
}) => {
  return (
    <div 
      className="bg-white dark:bg-hd-dark-header border border-slate-200 dark:border-hd-dark-border rounded-lg p-4 mt-4"
      id="map_correspondence_table_container"
    >
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-hd-dark-border pb-3 mb-3.5">
        <div className="p-2 bg-red-550/10 rounded-md">
          <Compass className="w-4 h-4 text-red-500 animate-pulse" />
        </div>
        <div>
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-hd-dark-text-bright">
            {lang === "uk" ? "📋 ТАБЛИЦЯ ВІДПОВІДНОСТІ «КАРТА ➔ ФАЙЛ ЗОБРАЖЕННЯ»" : "📋 'MAP ➔ WEBP IMAGE' CORRESPONDENCE TABLE"}
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">
            {lang === "uk" ? "Системний реєстр локальних тактичних зображень карт у форматі WebP" : "System register of local strategic and tactical map images in high-resolution WebP format"}
          </p>
        </div>
      </div>

      {/* If the current map does not have a linked image, highlight a warning */}
      {!localMapMapping[currentMap.id] && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-md text-[11px] font-bold mb-4 font-sans flex items-center gap-2">
          <span className="text-sm">⚠️</span>
          <div>
            <p className="font-black uppercase tracking-wider">
              {lang === "uk" ? "Увага: Карта не прив'язана до файлу!" : "Warning: Map Asset Unlinked!"}
            </p>
            <p className="font-medium text-[10px] text-amber-400/90 mt-0.5">
              {lang === "uk" 
                ? `Для поточної вибраної карти «${currentMap.nameUA}» не знайдено прив'язку до локального файлу WEBP у конфігурації.`
                : `The currently selected map '${currentMap.nameEN}' does not have a local WebP destination asset mapped.`}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar border border-slate-150 dark:border-hd-dark-border rounded">
        <table className="w-full text-left text-[11px] text-slate-650 dark:text-hd-dark-text font-mono">
          <thead className="sticky top-0 bg-slate-50 dark:bg-hd-dark-sidebar border-b border-slate-200 dark:border-hd-dark-border z-10">
            <tr className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">
              <th className="p-2 px-3">{lang === "uk" ? "Назва карти" : "Map Name"}</th>
              <th className="p-2">{lang === "uk" ? "ID Карти" : "Map ID"}</th>
              <th className="p-2">{lang === "uk" ? "Шлях до файлу WEBP" : "WEBP Filename & Path"}</th>
              <th className="p-2 px-3 text-right">{lang === "uk" ? "Статус зв'язку" : "Mapping Status"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-hd-dark-border">
            {maps.map((m) => {
              const webpFile = localMapMapping[m.id];
              const isLinked = !!webpFile;
              const isCurrentActive = m.id === currentMap.id;
              return (
                <tr 
                  key={m.id} 
                  className={`${isCurrentActive ? "bg-red-500/5 font-bold" : ""} hover:bg-slate-50 dark:hover:bg-hd-dark-sidebar/40 transition-colors`}
                >
                  <td className="p-2 px-3 text-slate-800 dark:text-hd-dark-text-bright font-sans font-bold flex items-center gap-1.5 py-2.5">
                    {lang === "uk" ? m.nameUA : m.nameEN}
                    {isCurrentActive && (
                      <span className="text-[8px] bg-red-650 text-white px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider shadow-sm">
                        {lang === "uk" ? "вибрана" : "active"}
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-slate-400 dark:text-slate-500">{m.id}</td>
                  <td className="p-2 text-red-500 font-bold font-mono">
                    {isLinked ? `/${webpFile}` : "—"}
                  </td>
                  <td className="p-2 px-3 text-right">
                    {isLinked ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[9.5px] px-2 py-0.5 rounded font-black font-sans">
                        ✅ {lang === "uk" ? "Прив'язано" : "Linked"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[9.5px] px-2 py-0.5 rounded font-black font-sans">
                        ⚠️ {lang === "uk" ? "Немає файлу!" : "Unlinked!"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
