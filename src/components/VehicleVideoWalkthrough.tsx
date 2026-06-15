import React, { useState, useEffect } from "react";
import { YoutubePlayer } from "./YoutubePlayer";
import { Video, HelpCircle, Trophy, Sparkles } from "lucide-react";
import initialVideos from "../data/videos.json";

interface VideoWalkthroughProps {
  vehicleId: string;
  title: string;
  defaultYoutubeId?: string;
  lang?: string;
  videosList?: any[];
}

export const VehicleVideoWalkthrough: React.FC<VideoWalkthroughProps> = ({
  vehicleId,
  title,
  defaultYoutubeId,
  lang = "uk",
  videosList,
}) => {
  const currentVideos = videosList || initialVideos;

  // Find vehicle guides
  const vehicleVideos = currentVideos.filter(
    (vid) => vid.targetId === vehicleId && vid.category === "vehicles"
  );

  // Find general battle/game mode guides
  const combatVideos = currentVideos.filter((vid) => vid.category === "battles");

  // Combine into a master list of candidates
  const allCandidates = [...vehicleVideos, ...combatVideos];

  // If we have a default youtubeId on the vehicle element but no custom catalogued video, add it as fallback
  if (defaultYoutubeId && !allCandidates.some((v) => v.youtubeId === defaultYoutubeId)) {
    allCandidates.unshift({
      id: "vid_default",
      targetId: vehicleId,
      category: "vehicles",
      titleUA: `${title} - Відеоінструкція`,
      titleEN: `${title} - Walkthrough Guide`,
      youtubeId: defaultYoutubeId,
    });
  }

  // Active video index
  const [activeVidIdx, setActiveVidIdx] = useState(0);

  // If absolutely no video matches or is parsed, show placeholder
  if (allCandidates.length === 0) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-hd-dark-bg/30 border border-slate-200 dark:border-hd-dark-border p-4 rounded-md items-center justify-center text-center">
        <HelpCircle className="w-8 h-8 text-slate-400 mb-2" />
        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">No Guides Archived</h5>
        <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
          No video tutorials have been listed yet for this unit.
        </p>
      </div>
    );
  }

  const selectedVideo = allCandidates[activeVidIdx] || allCandidates[0];

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Target video player box */}
      <div className="w-full relative shadow-sm rounded-lg overflow-hidden border border-slate-200 dark:border-hd-dark-border bg-slate-950">
        <YoutubePlayer
          youtubeId={selectedVideo.youtubeId}
          title={lang === "uk" ? selectedVideo.titleUA : selectedVideo.titleEN}
          lang={lang}
        />
      </div>

      {/* Heading label with subtitle details */}
      <div className="px-1 py-0.5">
        <h5 className="text-[10.5px] font-black text-slate-800 dark:text-hd-dark-text-bright leading-tight flex items-center gap-1">
          <Video className="w-3.5 h-3.5 text-red-500" />
          {lang === "uk" ? selectedVideo.titleUA : selectedVideo.titleEN}
        </h5>
      </div>

      {/* Segment Selector tabs if multiple guides are registered */}
      {allCandidates.length > 1 && (
        <div className="flex flex-col gap-1.5 mt-1 border-t border-slate-100 dark:border-hd-dark-border pt-2.5">
          <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            {lang === "uk" ? "ДОСТУПНІ ВІДЕОІНСТРУКЦІЇ:" : "AVAILABLE STRATEGY GUIDES:"}
          </span>
          
          <div className="grid grid-cols-1 gap-1 max-h-[140px] overflow-y-auto pr-1">
            {allCandidates.map((vid, idx) => {
              const isSelected = activeVidIdx === idx;
              const isBattleType = vid.category === "battles";
              return (
                <button
                  key={vid.id + idx}
                  onClick={() => setActiveVidIdx(idx)}
                  className={`text-left text-[10px] py-1.5 px-2 rounded-md transition border flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-red-600/10 border-red-500/30 text-red-600 dark:text-red-400 font-extrabold"
                      : "bg-slate-50 dark:bg-hd-dark-bg/60 hover:bg-slate-100 dark:hover:bg-hd-dark-bg border-slate-200 dark:border-hd-dark-border text-slate-650 dark:text-hd-dark-text font-medium"
                  }`}
                >
                  <span className="truncate flex-1">
                    {lang === "uk" ? vid.titleUA : vid.titleEN}
                  </span>
                  
                  {isBattleType ? (
                    <span className="text-[8px] font-bold px-1.5 py-0.2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded flex items-center gap-0.5 whitespace-nowrap flex-shrink-0">
                      <Trophy className="w-2.5 h-2.5" />
                      {lang === "uk" ? "Режим" : "Mode"}
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold px-1.5 py-0.2 bg-red-600/10 text-red-500 border border-red-500/20 rounded flex items-center gap-0.5 whitespace-nowrap flex-shrink-0">
                      <Sparkles className="w-2.5 h-2.5" />
                      {lang === "uk" ? "Техніка" : "Vehicle"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
