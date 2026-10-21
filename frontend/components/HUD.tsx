import React from 'react';
import { Heart, Zap, Award, Flame, Volume2, VolumeX, Pause, Sparkles, Download } from 'lucide-react';
import { QuestionData } from '../types';

interface HUDProps {
  hp: number;
  maxHp: number;
  score: number;
  combo: number;
  levelNumber: number;
  levelTitle: string;
  currentQuestion: QuestionData | null;
  rageMeter: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onActivateJutsu: () => void;
  onOpenDownload: () => void;
  feedbackMessage: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  hp,
  maxHp,
  score,
  combo,
  levelNumber,
  currentQuestion,
  rageMeter,
  isMuted,
  onToggleMute,
  onPause,
  onActivateJutsu,
  onOpenDownload,
  feedbackMessage
}) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none px-2.5 pt-2 sm:p-4 flex flex-col gap-1.5">
      {/* Row 1: Compact Status Bar (HP, Score, Download, Audio, Pause) */}
      <div className="flex items-center justify-between pointer-events-auto gap-1.5">
        {/* Left: Level & HP Bar */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg">
          <div className="text-[11px] sm:text-xs font-black text-amber-400 uppercase">
            Lv.{levelNumber}
          </div>
          <div className="w-20 sm:w-32 flex flex-col gap-0.5">
            <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-slate-300 font-bold">
              <span className="flex items-center gap-0.5 text-red-400">
                <Heart size={10} className="fill-red-500 text-red-500" /> HP
              </span>
              <span>{Math.max(0, Math.round(hp))}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  hpPercent > 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                  hpPercent > 25 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                  'bg-gradient-to-r from-red-600 to-rose-400 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center on Landscape / Tablet: Math Question */}
        {currentQuestion && (
          <div className="hidden sm:flex bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-amber-400/90 rounded-2xl px-6 py-1 shadow-2xl flex-col items-center">
            <div className="text-[10px] text-amber-300 font-bold tracking-widest uppercase">
              TEWASKAN JAWAPAN BETUL:
            </div>
            <div className="text-2xl font-black text-white tracking-wider flex items-center gap-1.5">
              <span>{currentQuestion.factor1}</span>
              <span className="text-red-400">×</span>
              <span>{currentQuestion.factor2}</span>
              <span className="text-amber-400">=</span>
              <span className="text-yellow-300 bg-red-950/90 px-2 rounded border border-amber-400/60 font-mono">?</span>
            </div>
          </div>
        )}

        {/* Right: Rage Jutsu, Score, Download, Mute & Pause */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onActivateJutsu}
            disabled={rageMeter < 100}
            className={`px-2 py-1.5 rounded-xl border flex items-center gap-1 text-[11px] font-black transition-all shadow-md ${
              rageMeter >= 100
                ? 'bg-gradient-to-r from-amber-500 to-red-500 border-amber-300 text-white animate-pulse cursor-pointer active:scale-95'
                : 'bg-slate-900/80 border-slate-700 text-slate-500'
            }`}
          >
            <Zap size={12} className={rageMeter >= 100 ? 'fill-yellow-300 text-yellow-300' : ''} />
            <span>{Math.round(rageMeter)}%</span>
          </button>

          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-1 shadow-lg">
            <Award size={13} className="text-amber-400" />
            <span className="font-mono font-black text-amber-300 text-xs sm:text-sm">
              {score}
            </span>
          </div>

          <button
            onClick={onOpenDownload}
            className="p-2 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl border border-emerald-400 active:scale-90 shadow-md"
            aria-label="Download ke Fon"
            title="Download ke Android / iOS"
          >
            <Download size={15} />
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900/90 text-slate-300 rounded-xl border border-slate-700 active:scale-90"
            aria-label="Bunyi"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            onClick={onPause}
            className="p-2 bg-slate-900/90 text-slate-300 rounded-xl border border-slate-700 active:scale-90"
            aria-label="Jeda"
          >
            <Pause size={15} />
          </button>
        </div>
      </div>

      {/* Row 2 on Mobile Portrait: Large Clear Math Question Banner */}
      {currentQuestion && (
        <div className="flex sm:hidden justify-center pointer-events-none">
          <div className="bg-gradient-to-r from-red-950/95 via-slate-900/95 to-red-950/95 border-2 border-amber-400/90 rounded-2xl px-5 py-1 shadow-xl flex items-center gap-2.5">
            <span className="text-[10px] text-amber-300 font-black uppercase tracking-wider">SASARAN:</span>
            <div className="text-xl font-black text-white flex items-center gap-1">
              <span>{currentQuestion.factor1}</span>
              <span className="text-red-400">×</span>
              <span>{currentQuestion.factor2}</span>
              <span className="text-amber-400">=</span>
              <span className="text-yellow-300 bg-red-950 px-2 py-0.5 rounded-lg border border-amber-400/60 font-mono">?</span>
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Combo & Educational Feedback Pill */}
      <div className="flex flex-wrap justify-between items-center gap-1 pointer-events-none px-1">
        {combo >= 2 ? (
          <div className="bg-gradient-to-r from-amber-600/90 to-red-600/90 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <Flame size={12} className="text-yellow-300 fill-yellow-300" />
            <span className="text-[11px] font-black text-yellow-100">
              {combo}x KOMBO!
            </span>
          </div>
        ) : <div />}

        {feedbackMessage && (
          <div className="bg-slate-950/90 border border-amber-400/80 px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold text-amber-200 shadow-lg flex items-center gap-1 max-w-full truncate">
            <Sparkles size={12} className="text-amber-400 shrink-0" />
            <span className="truncate">{feedbackMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
