import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Compass,
  Sparkles
} from 'lucide-react';
import { DieShot } from '../../types';

export interface DieShotViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dieShots?: DieShot[];
  initialIndex?: number;
  chipName?: string;
}

export const DieShotViewerModal: React.FC<DieShotViewerModalProps> = ({
  isOpen,
  onClose,
  dieShots = [],
  initialIndex = 0,
  chipName = 'Silicon Die',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [fitScale, setFitScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimapDragging, setIsMinimapDragging] = useState(false);
  const [isWheelZooming, setIsWheelZooming] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isInitialOpenRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const isMinimapDraggingRef = useRef(false);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prevNormalizedCenterRef = useRef<{ normX: number; normY: number; scale: number }>({
    normX: 0.5,
    normY: 0.5,
    scale: 1.0,
  });

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number }>({
    mouseX: 0,
    mouseY: 0,
    panX: 0,
    panY: 0,
  });
  const hasDraggedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number; distance?: number; scale?: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const activeShot = dieShots[currentIndex] || dieShots[0];

  // Compute fit scale so entire die shot fits on screen
  const computeFitScale = useCallback((naturalW: number, naturalH: number) => {
    if (!naturalW || !naturalH || !viewportRef.current) return 1.0;
    const vpW = viewportRef.current.clientWidth;
    const vpH = viewportRef.current.clientHeight;
    // Leave small margin for top header
    const availableW = Math.max(200, vpW - 32);
    const availableH = Math.max(200, vpH - 80);
    const fit = Math.min(availableW / naturalW, availableH / naturalH, 1.0);
    return Math.max(fit, 0.05);
  }, []);

  // Sync index on open
  useEffect(() => {
    if (isOpen) {
      const validIndex = Math.max(0, Math.min(initialIndex, dieShots.length - 1));
      setCurrentIndex(validIndex);
      isInitialOpenRef.current = true;
      setImageLoaded(false);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex, dieShots.length]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Image load handler: keeps zoom & pan when comparing between die shots!
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const oldNW = naturalSize.width || nw;
    const oldNH = naturalSize.height || nh;
    setNaturalSize({ width: nw, height: nh });

    const fit = computeFitScale(nw, nh);
    setFitScale(fit);

    if (isInitialOpenRef.current) {
      // First open: show full die shot fitted to screen
      setScale(fit);
      setPan({ x: 0, y: 0 });
      isInitialOpenRef.current = false;
    } else {
      // User is comparing die shots! DO NOT RESET VIEW!
      const wasAtFit = Math.abs(scale - fitScale) < 0.05;

      if (wasAtFit) {
        // If user was viewing full die shot, fit the new one too
        setScale(fit);
        setPan({ x: 0, y: 0 });
      } else {
        // User was ZOOMED IN: preserve exact zoom scale and lock onto the same spot!
        const prevDispW = oldNW * scale;
        const prevDispH = oldNH * scale;
        const normCenterX = (prevDispW / 2 - pan.x) / prevDispW;
        const normCenterY = (prevDispH / 2 - pan.y) / prevDispH;

        const targetScale = scale;
        const newDispW = nw * targetScale;
        const newDispH = nh * targetScale;

        const newPanX = (0.5 - normCenterX) * newDispW;
        const newPanY = (0.5 - normCenterY) * newDispH;

        setScale(targetScale);
        setPan({ x: newPanX, y: newPanY });
      }
    }

    setImageLoaded(true);
  };

  // Recompute fit on window resize
  useEffect(() => {
    const handleResize = () => {
      if (naturalSize.width > 0 && naturalSize.height > 0) {
        const fit = computeFitScale(naturalSize.width, naturalSize.height);
        setFitScale(fit);
        // If user was at fit, adjust scale to match new fit
        setScale((prev) => (Math.abs(prev - fitScale) < 0.02 ? fit : prev));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [naturalSize, fitScale, computeFitScale]);

  // Zoom helpers
  const zoomIn = () => {
    setScale((prev) => Math.min(prev * 1.25, 10.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev / 1.25, fitScale * 0.2, 0.05));
  };

  const toggleFit100 = () => {
    const isShowingFull = Math.abs(scale - fitScale) < 0.05 || scale < 0.95;
    if (isShowingFull) {
      setScale(1.0);
      setPan({ x: 0, y: 0 });
    } else {
      setScale(fitScale);
      setPan({ x: 0, y: 0 });
    }
  };

  // Toggle between Full Die Shot and 100% on viewport click, centered on cursor
  const handleViewportClick = (clientX?: number, clientY?: number) => {
    if (hasDraggedRef.current) return;
    const isShowingFull = Math.abs(scale - fitScale) < 0.05 || scale < 0.95;
    if (isShowingFull) {
      const targetScale = 1.0;
      if (clientX !== undefined && clientY !== undefined && viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        const cx = clientX - (rect.left + rect.width / 2);
        const cy = clientY - (rect.top + rect.height / 2);
        const ratio = targetScale / scale;
        const newPanX = cx - (cx - pan.x) * ratio;
        const newPanY = cy - (cy - pan.y) * ratio;
        setScale(targetScale);
        setPan({ x: newPanX, y: newPanY });
      } else {
        setScale(targetScale);
        setPan({ x: 0, y: 0 });
      }
    } else {
      setScale(fitScale);
      setPan({ x: 0, y: 0 });
    }
  };

  // Record normalized center before switching shots so compare view stays locked
  const recordNormalizedCenter = () => {
    if (naturalSize.width > 0 && scale > 0) {
      const dispW = naturalSize.width * scale;
      const dispH = naturalSize.height * scale;
      prevNormalizedCenterRef.current = {
        normX: (dispW / 2 - pan.x) / dispW,
        normY: (dispH / 2 - pan.y) / dispH,
        scale: scale,
      };
    }
  };

  // Navigate between images (DOES NOT RESET VIEW WHEN ZOOMED IN!)
  const prevShot = () => {
    if (dieShots.length <= 1) return;
    recordNormalizedCenter();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : dieShots.length - 1));
  };

  const nextShot = () => {
    if (dieShots.length <= 1) return;
    recordNormalizedCenter();
    setCurrentIndex((prev) => (prev < dieShots.length - 1 ? prev + 1 : 0));
  };

  // --- MINIMAP INTERACTION ---
  const updatePanFromMinimap = useCallback((clientX: number, clientY: number) => {
    if (!minimapRef.current || naturalSize.width === 0) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const mx = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const my = Math.max(0, Math.min(rect.height, clientY - rect.top));

    const normX = mx / rect.width;
    const normY = my / rect.height;

    let targetScale = scale;
    if (scale <= fitScale * 1.05) {
      targetScale = 1.0;
      setScale(1.0);
    }

    const displayedW = naturalSize.width * targetScale;
    const displayedH = naturalSize.height * targetScale;

    const newPanX = (0.5 - normX) * displayedW;
    const newPanY = (0.5 - normY) * displayedH;

    setPan({ x: newPanX, y: newPanY });
  }, [naturalSize.width, naturalSize.height, scale, fitScale]);

  const handleMinimapMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    isMinimapDraggingRef.current = true;
    setIsMinimapDragging(true);
    updatePanFromMinimap(e.clientX, e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isMinimapDraggingRef.current) {
        updatePanFromMinimap(moveEvent.clientX, moveEvent.clientY);
      }
    };

    const onMouseUp = () => {
      isMinimapDraggingRef.current = false;
      setIsMinimapDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleMinimapTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      isMinimapDraggingRef.current = true;
      setIsMinimapDragging(true);
      updatePanFromMinimap(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMinimapTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (isMinimapDraggingRef.current && e.touches.length > 0) {
      updatePanFromMinimap(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMinimapTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    isMinimapDraggingRef.current = false;
    setIsMinimapDragging(false);
  };

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  // Maintain mutable ref of current pan/scale for native event listener
  const stateRef = useRef({ scale, pan, fitScale, naturalSize });
  stateRef.current = { scale, pan, fitScale, naturalSize };

  // Attach native wheel listener with passive: false to prevent browser zoom & ensure 100% smooth cursor anchoring
  useEffect(() => {
    if (!isOpen) return;
    const el = viewportRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const { scale: curScale, pan: curPan, fitScale: curFit, naturalSize: curNatSize } = stateRef.current;
      if (!curNatSize.width || !viewportRef.current) return;

      // Disable transition interpolation during wheel zoom so point stays pinned under cursor
      setIsWheelZooming(true);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        setIsWheelZooming(false);
      }, 120);

      const isPinch = e.ctrlKey;
      const delta = isPinch ? -e.deltaY : -Math.max(-30, Math.min(30, e.deltaY));
      const factor = isPinch ? Math.exp(delta * 0.01) : Math.exp(delta * 0.003);

      const newScale = Math.min(Math.max(curScale * factor, curFit * 0.15, 0.05), 10.0);
      if (Math.abs(newScale - curScale) < 0.0001) return;

      // Viewport coordinates of cursor relative to viewport center
      const rect = viewportRef.current.getBoundingClientRect();
      const cx = e.clientX - (rect.left + rect.width / 2);
      const cy = e.clientY - (rect.top + rect.height / 2);

      // Keep the exact point directly under cursor pinned without moving around
      const ratio = newScale / curScale;
      const newPanX = cx - (cx - curPan.x) * ratio;
      const newPanY = cy - (cy - curPan.y) * ratio;

      setScale(newScale);
      setPan({ x: newPanX, y: newPanY });
    };

    el.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelNative);
    };
  }, [isOpen]);

  // Mouse drag panning on main viewport
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDraggedRef.current = true;
    }
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging && !hasDraggedRef.current) {
      handleViewportClick(e.clientX, e.clientY);
    }
    setIsDragging(false);
  };

  // Touch handlers (pan and pinch-to-zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      hasDraggedRef.current = false;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX: pan.x,
        panY: pan.y,
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        distance: dist,
        scale: scale,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        hasDraggedRef.current = true;
      }
      setPan({
        x: touchStartRef.current.panX + dx,
        y: touchStartRef.current.panY + dy,
      });
    } else if (e.touches.length === 2 && touchStartRef.current.distance && touchStartRef.current.scale) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartRef.current.distance;
      const newScale = Math.min(Math.max(touchStartRef.current.scale * factor, 0.05), 10.0);
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && !hasDraggedRef.current && touchStartRef.current) {
      handleViewportClick(touchStartRef.current.x, touchStartRef.current.y);
    }
    setIsDragging(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        zoomOut();
      } else if (e.key === '0') {
        setScale(fitScale);
        setPan({ x: 0, y: 0 });
      } else if (e.key === '1') {
        setScale(1.0);
      } else if (e.key === 'ArrowLeft' || e.key === '[') {
        prevShot();
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        nextShot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dieShots.length, fitScale]);

  if (!isOpen || !activeShot) return null;

  const currentPercent = Math.round(scale * 100);
  const isAtNative100 = Math.abs(scale - 1.0) < 0.02;
  const isAtFit = Math.abs(scale - fitScale) < 0.02;

  // Minimap dimensions calculation
  const miniW = 180;
  const miniH = naturalSize.width ? Math.round(miniW * (naturalSize.height / naturalSize.width)) : 140;
  const vpW = viewportRef.current?.clientWidth || 1000;
  const vpH = viewportRef.current?.clientHeight || 800;

  let miniRectX = 0;
  let miniRectY = 0;
  let miniRectW = miniW;
  let miniRectH = miniH;

  if (naturalSize.width > 0 && scale > 0) {
    const displayedW = naturalSize.width * scale;
    const displayedH = naturalSize.height * scale;
    const visRatioW = Math.min(1, vpW / displayedW);
    const visRatioH = Math.min(1, vpH / displayedH);
    miniRectW = Math.max(14, Math.round(miniW * visRatioW));
    miniRectH = Math.max(14, Math.round(miniH * visRatioH));

    const normCenterX = (displayedW / 2 - pan.x) / displayedW;
    const normCenterY = (displayedH / 2 - pan.y) / displayedH;
    miniRectX = Math.max(0, Math.min(miniW - miniRectW, Math.round(normCenterX * miniW - miniRectW / 2)));
    miniRectY = Math.max(0, Math.min(miniH - miniRectH, Math.round(normCenterY * miniH - miniRectH / 2)));
  }

  // Mounted to document.body, escaping all parent modals and containers
  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[999999] w-screen h-screen bg-slate-950/98 backdrop-blur-3xl flex flex-col text-slate-100 select-none overflow-hidden animate-fade-in"
      style={{ margin: 0, padding: 0 }}
    >
      {/* 1. SIMPLIFIED UNIFIED TOP HEADER BAR (All controls in one compact row) */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-3 sm:px-5 py-2 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-30 shadow-xl">
        {/* Left: Chip info and caption */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shrink-0 shadow-sm">
            {chipName}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[140px] sm:max-w-xs md:max-w-md lg:max-w-lg">
            {activeShot.caption}
          </span>
        </div>

        {/* Center / Right: Simplified Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Compare switcher (When chip has multiple die shots, e.g. M5 floorplan vs raw die) */}
          {dieShots.length > 1 && (
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80 shadow-sm">
              <button
                onClick={prevShot}
                title="Compare: Previous Shot (Left Arrow)"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-purple-200 font-semibold select-none">
                {currentIndex + 1}/{dieShots.length}
              </span>
              <button
                onClick={nextShot}
                title="Compare: Next Shot (Right Arrow)"
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80 shadow-sm">
            <button
              onClick={zoomOut}
              title="Zoom Out (-)"
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold px-1.5 min-w-[46px] text-center text-white select-none">
              {currentPercent}%
            </span>
            <button
              onClick={zoomIn}
              title="Zoom In (+)"
              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Fit / 100% toggle */}
          <button
            onClick={toggleFit100}
            title={isAtFit ? 'Zoom to 100% Native Size (1)' : 'Fit Entire Die Shot to Screen (0)'}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition shadow-sm ${
              isAtNative100
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-purple-900/50'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {isAtFit ? '100%' : 'Fit'}
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5 hidden sm:block" />

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition shadow-sm"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-purple-300" /> : <Maximize2 className="w-4 h-4 text-purple-300" />}
          </button>

          {/* Close Modal */}
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onClose();
            }}
            title="Close viewer (Esc)"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/80 hover:text-rose-200 text-slate-300 border border-slate-700 transition shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN INTERACTIVE VIEWPORT (Full Screen, No Bottom Bar!) */}
      <div
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] select-none ${
          isDragging
            ? 'cursor-grabbing'
            : (Math.abs(scale - fitScale) < 0.05 || scale < 0.95)
              ? 'cursor-zoom-in'
              : 'cursor-grab'
        }`}
      >
        {/* Loading Spinner */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-slate-950/90">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-sm font-mono text-purple-300">Loading die shot...</p>
          </div>
        )}

        {/* Transformed Image Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
            transition: 'none',
          }}
          className="relative inline-block"
        >
          <img
            ref={imgRef}
            src={activeShot.url}
            alt={activeShot.caption}
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              width: naturalSize.width ? `${naturalSize.width * scale}px` : 'auto',
              height: naturalSize.height ? `${naturalSize.height * scale}px` : 'auto',
              maxWidth: 'none',
              maxHeight: 'none',
              imageRendering: scale > 1.2 ? 'pixelated' : 'auto',
            }}
            className={`shadow-2xl rounded-sm transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        {/* Floating Left / Right Compare Buttons (When multiple shots, keeping zoom & pan locked) */}
        {dieShots.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevShot();
              }}
              title="Compare: Previous Die Shot (Left Arrow)"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/85 hover:bg-purple-950 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 z-20 group"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-purple-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextShot();
              }}
              title="Compare: Next Die Shot (Right Arrow)"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/85 hover:bg-purple-950 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 z-20 group"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-purple-300" />
            </button>
          </>
        )}

        {/* INTERACTIVE OVERVIEW PREVIEW (Click or drag to pick which part to see) */}
        {imageLoaded && naturalSize.width > 0 && (
          <div
            className="absolute right-4 bottom-4 z-20 bg-slate-900/95 border border-slate-700/90 rounded-2xl p-2 shadow-2xl backdrop-blur-md hidden sm:block select-none"
            style={{ width: `${miniW + 16}px` }}
          >
            <div className="flex items-center justify-between pb-1 px-0.5 text-xs text-slate-200 font-mono">
              <span className="flex items-center gap-1 font-bold text-slate-200">
                <Compass className="w-3.5 h-3.5 text-purple-400" /> Overview
              </span>
              <span className="text-purple-300 font-bold">{currentPercent}%</span>
            </div>

            {/* Clickable & Draggable Minimap Container */}
            <div
              ref={minimapRef}
              onMouseDown={handleMinimapMouseDown}
              onTouchStart={handleMinimapTouchStart}
              onTouchMove={handleMinimapTouchMove}
              onTouchEnd={handleMinimapTouchEnd}
              className="relative overflow-hidden rounded-xl bg-black border border-slate-700/80 cursor-crosshair group/minimap shadow-inner select-none"
              style={{ width: `${miniW}px`, height: `${miniH}px` }}
              title="Click or drag to pick which part of the die shot to see"
            >
              <img
                src={activeShot.url}
                alt="Overview Die Shot Map"
                className="w-full h-full object-contain opacity-75 pointer-events-none group-hover/minimap:opacity-95 transition-opacity"
                draggable={false}
              />

              {/* Viewport Frustum Box (Shows active visible crop) */}
              <div
                className="absolute border-2 border-purple-400 bg-purple-500/30 rounded-md pointer-events-none shadow-lg ring-1 ring-purple-300/60 transition-all"
                style={{
                  left: `${miniRectX}px`,
                  top: `${miniRectY}px`,
                  width: `${miniRectW}px`,
                  height: `${miniRectH}px`,
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
