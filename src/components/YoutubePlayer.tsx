import React, { useState, useEffect } from "react";
import { Play, Volume2, Loader2 } from "lucide-react";
import { translations } from "../data/translations";

interface YoutubePlayerProps {
  youtubeId?: string;
  title?: string;
  lang?: string;
}

export const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ youtubeId, title, lang = "uk" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const t = translations[lang] || translations["en"];

  useEffect(() => {
    if (!youtubeId) {
      setIsValid(false);
      return;
    }
    setIsValid(null);

    // Dynamic dual oEmbed/noembed and image dimension fallback verification
    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${youtubeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error || !data.title) {
          // Fallback to testing image load
          testThumbnail(youtubeId);
        } else {
          setIsValid(true);
        }
      })
      .catch(() => {
        testThumbnail(youtubeId);
      });
  }, [youtubeId]);

  const testThumbnail = (id: string) => {
    const img = new Image();
    img.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    img.onload = () => {
      // Missing YouTube videos return a 120x90 placeholder
      if (img.width === 120 && img.height === 90) {
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    };
    img.onerror = () => setIsValid(false);
  };

  if (!youtubeId || isValid === false) {
    return (
      <div className="aspect-video w-full bg-slate-100 dark:bg-hd-dark-bg rounded-md border border-dashed border-slate-300 dark:border-hd-dark-border flex flex-col items-center justify-center p-2.5 text-center">
        <Volume2 className="w-5 h-5 text-red-500 mb-1 animate-pulse" />
        <p className="text-xs text-slate-700 dark:text-hd-dark-text-bright font-bold animate-fade-in">
          {!youtubeId ? t.videoNotAdded : t.videoUnavailable}
        </p>
      </div>
    );
  }

  if (isValid === null) {
    return (
      <div className="aspect-video w-full bg-slate-100 dark:bg-hd-dark-bg rounded-md border border-slate-200 dark:border-hd-dark-border flex flex-col items-center justify-center p-2.5 text-center">
        <Loader2 className="w-6 h-6 text-slate-400 mb-1 animate-spin" />
        <p className="text-[10px] font-mono text-slate-500">
          {t.videoChecking}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full relative group">
      {!isPlaying ? (
        <div 
          onClick={() => setIsPlaying(true)}
          className="aspect-video w-full bg-slate-950 rounded-md overflow-hidden border border-slate-200 dark:border-hd-dark-border shadow-xs relative cursor-pointer flex items-center justify-center"
        >
          {/* Lazyloaded smart thumbnail image */}
          <img 
            src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} 
            alt={title || "YouTube Guide"}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <div className="z-10 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
          <span className="absolute bottom-1.5 left-2 z-10 text-[8px] font-mono text-slate-200 bg-slate-900/80 px-1.5 py-0.5 rounded">
            {t.videoLazyLoad}
          </span>
        </div>
      ) : (
        <div className="aspect-video w-full bg-slate-950 rounded-md overflow-hidden border border-slate-200 dark:border-hd-dark-border shadow-xs">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1`}
            title={title || "Gameplay Guide"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default YoutubePlayer;
