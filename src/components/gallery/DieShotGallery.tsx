import React, { useState } from 'react';
import { Image, ZoomIn, Sparkles } from 'lucide-react';
import { DieShot } from '../../types';
import { DieShotViewerModal } from './DieShotViewerModal';

export interface DieShotGalleryProps {
  dieShots?: DieShot[];
  chipName: string;
}

export const DieShotGallery: React.FC<DieShotGalleryProps> = ({ dieShots, chipName }) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  if (!dieShots || dieShots.length === 0) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setHoveredIdx(idx);
    setHoverCoord({ x, y });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Image className="w-3.5 h-3.5 text-purple-600" />
          Silicon Die Shots ({chipName})
        </h4>
        <span className="text-[10px] text-purple-600 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Hover to zoom • Click for full screen
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {dieShots.map((ds, idx) => (
          <div 
            key={idx} 
            onClick={() => setActiveImageIndex(idx)}
            className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-purple-500/60 bg-slate-950 cursor-pointer shadow-sm hover:shadow-lg transition-all"
          >
            <div 
              className="aspect-[16/10] overflow-hidden bg-slate-900 flex items-center justify-center relative"
              onMouseMove={(e) => handleMouseMove(e, idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <img 
                src={ds.url} 
                alt={ds.caption} 
                style={
                  hoveredIdx === idx
                    ? {
                        transformOrigin: `${hoverCoord.x}% ${hoverCoord.y}%`,
                        transform: 'scale(2.5)',
                        transition: 'transform 0.08s ease-out',
                      }
                    : {
                        transformOrigin: 'center center',
                        transform: 'scale(1)',
                        transition: 'transform 0.3s ease-out',
                      }
                }
                className="w-full h-full object-cover pointer-events-none" 
                loading="lazy"
              />

              {hoveredIdx === idx && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-200 border border-purple-500/70 text-[9px] font-mono flex items-center gap-1 shadow-lg pointer-events-none z-10 backdrop-blur">
                  <ZoomIn className="w-3 h-3 text-purple-300" />
                  <span>Hover to zoom • Click for full screen</span>
                </div>
              )}
            </div>

            <div className="p-2 bg-white border-t border-slate-100 flex items-start justify-between gap-1 text-[11px]">
              <span className="text-slate-700 font-medium line-clamp-1">{ds.caption}</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-bold flex items-center gap-0.5 shrink-0 mt-0.5">
                <ZoomIn className="w-2.5 h-2.5" />
                Die Shot
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Die Shot Viewer Modal */}
      <DieShotViewerModal
        isOpen={activeImageIndex !== null}
        onClose={() => setActiveImageIndex(null)}
        dieShots={dieShots}
        initialIndex={activeImageIndex ?? 0}
        chipName={chipName}
      />
    </div>
  );
};
