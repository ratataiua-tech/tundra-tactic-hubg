import React, { useState } from "react";
import { Shield, ZoomIn, Image as ImageIcon } from "lucide-react";
import vehiclesImages from "../data/vehicles_images.json";
import { ImageZoomModal } from "./ImageZoomModal";

interface VehicleImageGalleryProps {
  vehicleId: string;
  title: string;
  customImages?: string[];
}

export const VehicleImageGallery: React.FC<VehicleImageGalleryProps> = ({ vehicleId, title, customImages }) => {
  const images: string[] = customImages || (vehiclesImages as Record<string, string[]>)[vehicleId] || [];
  
  const [activeIdx, setActiveIdx] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [hasError, setHasError] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setHasError((prev) => ({ ...prev, [index]: true }));
  };

  const imagesToShow = images.filter((_, idx) => !hasError[idx]);
  const activeImage = imagesToShow[activeIdx];

  // If there are no images, show a distinctive, styled placeholder card
  if (imagesToShow.length === 0) {
    return (
      <div className="w-full aspect-[4/3] rounded-lg border border-dashed border-slate-250 dark:border-hd-dark-border bg-slate-50/50 dark:bg-hd-dark-bg/40 flex flex-col items-center justify-center p-4 text-center">
        <Shield className="w-8 h-8 text-slate-350 dark:text-slate-650 mb-2.5 animate-pulse" />
        <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
          Image Unavailable
        </h5>
        <p className="text-[9px] text-slate-400 max-w-[150px] mt-1.5 leading-normal">
          No tactical image has been archived for {title}.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2 relative">
      {/* Main Image Container */}
      <div 
        onClick={() => setIsZoomOpen(true)}
        className="w-full aspect-[4/3] bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-hd-dark-border-light relative group cursor-zoom-in"
      >
        <img
          src={activeImage}
          alt={`${title} view ${activeIdx + 1}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => handleImageError(activeIdx)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Shadow overlays */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex items-center justify-between pointer-events-none">
          <span className="text-[8px] font-mono font-medium text-white/90 bg-slate-900/80 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/5">
            HQ ARCHIVE • {activeIdx + 1}/{imagesToShow.length}
          </span>
          <span className="p-1 rounded-full bg-red-650/85 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ZoomIn className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Multiple Gallery Image Indicators */}
      {imagesToShow.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
          {imagesToShow.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`w-12 h-9 rounded-md overflow-hidden border transition relative flex-shrink-0 cursor-pointer ${
                activeIdx === idx
                  ? "border-red-600 ring-1 ring-red-500/30"
                  : "border-slate-200 dark:border-hd-dark-border opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Zoom modal */}
      <ImageZoomModal
        imageUrl={activeImage}
        altText={`${title} (View ${activeIdx + 1} of ${imagesToShow.length})`}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
};
