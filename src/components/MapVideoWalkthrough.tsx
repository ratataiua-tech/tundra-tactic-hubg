import React, { useState } from "react";
import { YoutubePlayer } from "./YoutubePlayer";
import { Video, HelpCircle, Eye } from "lucide-react";
import initialVideos from "../data/videos.json";

interface MapVideoWalkthroughProps {
  mapId: string;
  defaultYoutubeId?: string;
  lang?: string;
  videosList?: any[];
}

export const MapVideoWalkthrough: React.FC<MapVideoWalkthroughProps> = ({
  mapId,
  defaultYoutubeId,
  lang = "uk",
  videosList,
}) => {
  const currentVideos = videosList || initialVideos;

  // Find map-specific videos
  const mapVideos = currentVideos.filter(
    (vid) => vid.targetId === mapId && vid.category === "maps"
  );

  // Fallback default YoutubeId if not already in custom array
  if (defaultYoutubeId && !mapVideos.some((v) => v.youtubeId === defaultYoutubeId)) {
    mapVideos.unshift({
      id: "vid_map_default",
      targetId: mapId,
      category: "maps",
      titleUA: "Тактичний відеоогляд місцевості",
      titleEN: "Tactical map overview walkthrough",
      youtubeId: defaultYoutubeId,
    });
  }

  const [activeIdx, setActiveIdx] = useState(0);

  if (mapVideos.length === 0) {
    return (
      <div className="flex flex-col bg-slate-50 dark:bg-hd-dark-bg/20 border border-slate-200 dark:border-hd-dark-border p-3 rounded-md items-center justify-center text-center">
        <HelpCircle className="w-6 h-6 text-slate-400 mb-1" />
        <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No Walkthroughs</h6>
      </div>
    );
  }

  const selectedVideo = mapVideos[activeIdx] || mapVideos[0];

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Youtube embedded player box */}
      <div className="w-full relative shadow-sm rounded-lg overflow-hidden border border-slate-200 dark:border-hd-dark-border bg-slate-950">
        <YoutubePlayer
          youtubeId={selectedVideo.youtubeId}
          title={lang === "uk" ? selectedVideo.titleUA : selectedVideo.titleEN}
          lang={lang}
        />
      </div>

      {/* Selected video description or label */}
      <div className="px-0.5">
        <p className="text-[10px] font-black text-slate-700 dark:text-hd-dark-text-bright leading-tight flex items-center gap-1">
          <Eye className="w-3 h-3 text-red-500" />
          {lang === "uk" ? selectedVideo.titleUA : selectedVideo.titleEN}
        </p>
      </div>

      {/* Selector button group if multiple map guides exist */}
      {mapVideos.length > 1 && (
        <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-100 dark:border-hd-dark-border">
          {mapVideos.map((vid, idx) => (
            <button
              key={vid.id}
              onClick={() => setActiveIdx(idx)}
              className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition border cursor-pointer ${
                activeIdx === idx
                  ? "bg-red-600 border-red-650 text-white shadow-xs"
                  : "bg-slate-50 dark:bg-hd-dark-bg/50 hover:bg-slate-100 dark:hover:bg-hd-dark-bg text-slate-650 dark:text-hd-dark-text border-slate-250 dark:border-hd-dark-border"
              }`}
            >
              Guide {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
