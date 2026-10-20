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
    <div className="absolute bottom-3 left-0 right-0 z-20 pointer-events-none px-3 sm:px-8 flex justify-between items-end select-none">
      {/* Left D-Pad: Horizontal Run */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); onMoveLeftStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onMoveLeftEnd(); }}
          onMouseDown={onMoveLeftStart}
          onMouseUp={onMoveLeftEnd}
          onMouseLeave={onMoveLeftEnd}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 border-2 border-slate-600/80 active:bg-red-700/90 active:border-red-400 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform active:scale-95 touch-none"
          aria-label="Kiri"
        >
          <ArrowLeft size={28} />
        </button>

        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); onMoveRightStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onMoveRightEnd(); }}
          onMouseDown={onMoveRightStart}
          onMouseUp={onMoveRightEnd}
          onMouseLeave={onMoveRightEnd}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 border-2 border-slate-600/80 active:bg-red-700/90 active:border-red-400 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform active:scale-95 touch-none"
          aria-label="Kanan"
        >
          <ArrowRight size={28} />
        </button>
      </div>

      {/* Right Action Buttons: Jump, Dash, Slash, Special */}
      <div className="flex items-end gap-2 pointer-events-auto">
        {/* Special Jutsu Button (Small) */}
        {isSpecialReady && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onSpecial(); }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-2 border-yellow-200 text-slate-950 flex flex-col items-center justify-center shadow-lg shadow-amber-500/50 animate-bounce active:scale-90"
            aria-label="Rage Jutsu"
          >
            <Zap size={20} className="fill-slate-950" />
            <span className="text-[8px] font-black leading-none">JUTSU</span>
          </button>
        )}

        {/* Dash */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onDash(); }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/80 border-2 border-cyan-500/60 active:bg-cyan-600 active:border-cyan-300 text-cyan-200 flex flex-col items-center justify-center shadow-xl backdrop-blur-sm active:scale-90 touch-none"
          aria-label="Dash"
        >
          <Wind size={20} />
          <span className="text-[9px] font-bold">DASH</span>
        </button>

        {/* Jump */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onJump(); }}
          className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-slate-900/80 border-2 border-emerald-500/60 active:bg-emerald-600 active:border-emerald-300 text-emerald-200 flex flex-col items-center justify-center shadow-xl backdrop-blur-sm active:scale-90 touch-none"
          aria-label="Lompat"
        >
          <ArrowUp size={24} />
          <span className="text-[9px] font-bold">LOMPAT</span>
        </button>

        {/* Attack / Slash (Primary Large Button) */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onSlash(); }}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 border-2 border-red-300 active:from-red-700 active:to-rose-800 text-white flex flex-col items-center justify-center shadow-2xl shadow-red-600/50 active:scale-95 touch-none"
          aria-label="Serang"
        >
          <Sword size={26} className="rotate-45" />
          <span className="text-[10px] font-black tracking-wider">SERANG</span>
        </button>
      </div>
    </div>
  );
};
