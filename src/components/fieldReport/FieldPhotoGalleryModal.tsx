// OOS ETMS PRO — Field Photo Gallery Modal
// Lightbox gallery viewer for field inspection photos

import React, { useState } from 'react';
import { FieldReportPhoto } from '../../types/fieldReport';
import { X, ChevronLeft, ChevronRight, Download, Calendar, User, Tag, ExternalLink } from 'lucide-react';

interface FieldPhotoGalleryModalProps {
  photos: FieldReportPhoto[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIssue?: (issueId: string) => void;
}

export const FieldPhotoGalleryModal: React.FC<FieldPhotoGalleryModalProps> = ({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  onSelectIssue,
}) => {
  if (!isOpen || photos.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const currentPhoto = photos[currentIndex] || photos[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between p-4 text-white animate-in fade-in duration-150">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-blue-600/80 px-2.5 py-1 rounded-lg">
            Ảnh {currentIndex + 1} / {photos.length}
          </span>
          <span className="text-sm font-extrabold text-white truncate max-w-md">
            {currentPhoto.caption}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer z-10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <img
          src={currentPhoto.url}
          alt={currentPhoto.caption}
          className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl"
        />

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer z-10 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Info Bar & Thumbnails */}
      <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0 space-y-3 max-w-3xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              {currentPhoto.uploadedAt}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              {currentPhoto.uploadedBy}
            </span>
            {currentPhoto.lineCode && (
              <span className="font-mono text-cyan-300 font-bold bg-white/10 px-2 py-0.5 rounded">
                {currentPhoto.lineCode}
              </span>
            )}
          </div>

          {currentPhoto.relatedIssueId && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Vấn đề liên quan:</span>
              <button
                type="button"
                onClick={() => {
                  if (onSelectIssue && currentPhoto.relatedIssueId) {
                    onClose();
                    onSelectIssue(currentPhoto.relatedIssueId);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>{currentPhoto.relatedIssueId}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Thumbnails strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {photos.map((p, idx) => (
            <button
              key={p.id || idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                idx === currentIndex ? 'border-cyan-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
