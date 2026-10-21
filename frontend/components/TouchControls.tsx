import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Sword, Wind, Zap } from 'lucide-react';

interface TouchControlsProps {
  onMoveLeftStart: () => void;
  onMoveLeftEnd: () => void;
  onMoveRightStart: () => void;
  onMoveRightEnd: () => void;
  onJump: () => void;
  onSlash: () => void;
  onDash: () => void;
  onSpecial: () => void;
  isSpecialReady: boolean;
}

const triggerHaptic = (ms = 12) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch {
      // Ignore if unsupported
    }
  }
};

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeftStart,
  onMoveLeftEnd,
  onMoveRightStart,
  onMoveRightEnd,
  onJump,
  onSlash,
  onDash,
  onSpecial,
  isSpecialReady
}) => {
  return (
    <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-20 pointer-events-none px-2.5 sm:px-6 pb-[env(safe-area-inset-bottom,4px)] flex justify-between items-end select-none">
      {/* Left Thumb: Move Left & Right */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); triggerHaptic(8); onMoveLeftStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onMoveLeftEnd(); }}
          onMouseDown={onMoveLeftStart}
          onMouseUp={onMoveLeftEnd}
          onMouseLeave={onMoveLeftEnd}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/75 border-2 border-slate-500/80 active:bg-indigo-600 active:border-sky-300 text-white flex flex-col items-center justify-center shadow-xl backdrop-blur-md transition-transform active:scale-90 touch-none"
          aria-label="Gerak Kiri"
        >
          <ArrowLeft size={24} />
          <span className="text-[8px] font-black tracking-wider">KIRI</span>
        </button>

        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); triggerHaptic(8); onMoveRightStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onMoveRightEnd(); }}
          onMouseDown={onMoveRightStart}
          onMouseUp={onMoveRightEnd}
          onMouseLeave={onMoveRightEnd}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/75 border-2 border-slate-500/80 active:bg-indigo-600 active:border-sky-300 text-white flex flex-col items-center justify-center shadow-xl backdrop-blur-md transition-transform active:scale-90 touch-none"
          aria-label="Gerak Kanan"
        >
          <ArrowRight size={24} />
          <span className="text-[8px] font-black tracking-wider">KANAN</span>
        </button>
      </div>

      {/* Right Thumb: Arcade Action Cluster (Dash, Jump, Big Slash) */}
      <div className="flex items-end gap-1.5 sm:gap-2.5 pointer-events-auto">
        {isSpecialReady && (
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); triggerHaptic(25); onSpecial(); }}
            onClick={(e) => { e.preventDefault(); onSpecial(); }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white text-slate-950 flex flex-col items-center justify-center shadow-xl shadow-amber-500/50 animate-bounce active:scale-90 touch-none"
            aria-label="Rage Jutsu"
          >
            <Zap size={18} className="fill-slate-950" />
            <span className="text-[7px] font-black leading-none">JUTSU</span>
          </button>
        )}

        {/* Dash */}
        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); triggerHaptic(10); onDash(); }}
          onClick={(e) => { e.preventDefault(); onDash(); }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/75 border-2 border-cyan-400/70 active:bg-cyan-500 text-cyan-200 flex flex-col items-center justify-center shadow-xl backdrop-blur-md active:scale-90 touch-none"
          aria-label="Dash"
        >
          <Wind size={18} />
          <span className="text-[8px] font-black">DASH</span>
        </button>

        {/* Jump */}
        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); triggerHaptic(12); onJump(); }}
          onClick={(e) => { e.preventDefault(); onJump(); }}
          className="w-13 h-13 sm:w-15 sm:h-15 px-2.5 py-2 rounded-2xl bg-slate-900/75 border-2 border-emerald-400/70 active:bg-emerald-600 text-emerald-200 flex flex-col items-center justify-center shadow-xl backdrop-blur-md active:scale-90 touch-none"
          aria-label="Lompat"
        >
          <ArrowUp size={22} />
          <span className="text-[8px] font-black">LOMPAT</span>
        </button>

        {/* Primary Attack / Slash Button */}
        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); triggerHaptic(18); onSlash(); }}
          onClick={(e) => { e.preventDefault(); onSlash(); }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-red-500 via-rose-600 to-red-700 border-2 border-amber-300 active:from-amber-400 active:to-red-600 text-white flex flex-col items-center justify-center shadow-2xl shadow-red-600/60 active:scale-90 touch-none"
          aria-label="Serang"
        >
          <Sword size={26} className="rotate-45 drop-shadow" />
          <span className="text-[9px] font-black tracking-wider">SERANG</span>
        </button>
      </div>
    </div>
  );
};