import React, { useEffect } from "react";
import { X, ZoomIn } from "lucide-react";

interface ImageZoomModalProps {
  imageUrl: string;
  altText: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  imageUrl,
  altText,
  isOpen,
  onClose,
}) => {
  // Lock body scroll when zoom modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in cursor-zoom-out"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 z-51 flex items-center gap-2">
        <span className="text-[10px] font-mono text-white/65 bg-slate-900/70 border border-white/10 px-2.5 py-1 rounded-md hidden md:inline-flex items-center gap-1.5">
          <ZoomIn className="w-3.5 h-3.5 text-red-500" />
          Click anywhere to exit
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2.5 bg-red-750 text-white rounded-full border border-red-650 hover:bg-red-800 transition cursor-pointer"
          aria-label="Close zoomed view"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div 
        className="max-w-4xl max-h-[85vh] md:max-h-[90vh] flex flex-col items-center justify-center relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10 animate-scale-up"
          referrerPolicy="no-referrer"
        />
        {altText && (
          <p className="mt-4 text-xs font-semibold text-white/80 bg-slate-900/80 px-4 py-1.5 rounded-full border border-white/5 shadow-md">
            {altText}
          </p>
        )}
      </div>
    </div>
  );
};
