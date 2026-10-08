import React, { useState } from 'react';
import { Image, ZoomIn, ExternalLink, X } from 'lucide-react';
import { DieShot } from '../../types';

export interface DieShotGalleryProps {
  dieShots?: DieShot[];
  chipName: string;
}

export const DieShotGallery: React.FC<DieShotGalleryProps> = ({ dieShots, chipName }) => {
  const [activeImage, setActiveImage] = useState<DieShot | null>(null);

  if (!dieShots || dieShots.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Image className="w-3.5 h-3.5 text-blue-600" />
          Silicon Die Shots ({chipName})
        </h4>
        <span className="text-[10px] text-slate-400 font-medium">Click to inspect 4K die shot</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {dieShots.map((ds, idx) => (
          <div 
            key={idx} 
            onClick={() => setActiveImage(ds)}
            className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 cursor-pointer shadow-sm hover:shadow-md transition-all"
          >
            <div className="aspect-[16/10] overflow-hidden bg-slate-900 flex items-center justify-center">
              <img 
                src={ds.url} 
                alt={ds.caption} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                loading="lazy"
              />
            </div>
            <div className="p-2 bg-white border-t border-slate-100 flex items-start justify-between gap-1 text-[11px]">
              <span className="text-slate-700 font-medium line-clamp-1">{ds.caption}</span>
              <ZoomIn className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 text-white">
              <div>
                <h4 className="text-xs font-bold text-white">{activeImage.caption}</h4>
                <p className="text-[10px] text-slate-400">{chipName} Microscopic Die Floorplan</p>
              </div>
              <div className="flex items-center gap-2">
                {activeImage.originalUrl && (
                  <a 
                    href={activeImage.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded transition"
                  >
                    <span>Original Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button 
                  onClick={() => setActiveImage(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-black/70 max-h-[75vh]">
              <img 
                src={activeImage.url} 
                alt={activeImage.caption} 
                className="max-h-[72vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
