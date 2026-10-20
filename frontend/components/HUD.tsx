import React from 'react';
import { Heart, Zap, Award, Flame, Volume2, VolumeX, Pause, Sparkles } from 'lucide-react';
import { QuestionData } from '../types';

interface HUDProps {
  hp: number;
  maxHp: number;
  score: number;
  combo: number;
  levelNumber: number;
  levelTitle: string;
  currentQuestion: QuestionData | null;
  rageMeter: number; // 0 to 100
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onActivateJutsu: () => void;
  feedbackMessage: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  hp,
  maxHp,
  score,
  combo,
  levelNumber,
  levelTitle,
  currentQuestion,
  rageMeter,
  isMuted,
  onToggleMute,
  onPause,
  onActivateJutsu,
  feedbackMessage
}) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2 sm:p-4 flex flex-col gap-2">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Left: Level & HP */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg">
          <div className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider">
            Lv.{levelNumber}
          </div>
          <div className="w-24 sm:w-36 flex flex-col gap-0.5">
            <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold">
              <span className="flex items-center gap-1 text-red-400">
                <Heart size={12} className="fill-red-500 text-red-500 animate-pulse" /> HP
              </span>
              <span>{Math.max(0, Math.round(hp))}/{maxHp}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
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

        {/* Center: Live Math Banner */}
        <div className="flex flex-col items-center">
          {currentQuestion ? (
            <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-500/80 rounded-2xl px-4 sm:px-8 py-1.5 shadow-2xl shadow-red-950/70 flex flex-col items-center animate-bounce-short">
              <div className="text-[10px] sm:text-xs text-red-400 font-bold tracking-widest uppercase">
                SASARKAN MUSUH:
              </div>
              <div className="text-xl sm:text-3xl font-black text-white tracking-wider flex items-center gap-1.5 drop-shadow-[0_2px_8px_rgba(239,68,68,0.8)]">
                <span>{currentQuestion.factor1}</span>
                <span className="text-red-400">×</span>
                <span>{currentQuestion.factor2}</span>
                <span className="text-amber-400">=</span>
                <span className="text-yellow-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/60 font-mono">?</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 px-4 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-amber-300">
              Memuatkan Gelombang...
            </div>
          )}
        </div>

        {/* Right: Score, Combo & Controls */}
        <div className="flex items-center gap-2">
          {/* Rage / Jutsu Button */}
          <button
            onClick={onActivateJutsu}
            disabled={rageMeter < 100}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-black transition-all shadow-md ${
              rageMeter >= 100
                ? 'bg-gradient-to-r from-amber-500 to-red-500 border-amber-300 text-white animate-pulse shadow-amber-500/50 cursor-pointer active:scale-95'
                : 'bg-slate-900/80 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
            title="Serangan Khas Rage Jutsu"
          >
            <Zap size={14} className={rageMeter >= 100 ? 'fill-yellow-300 text-yellow-300 animate-spin' : ''} />
            <span className="hidden sm:inline">JUTSU</span>
            <span>{Math.round(rageMeter)}%</span>
          </button>

          {/* Score Badge */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2 shadow-lg">
            <Award size={14} className="text-amber-400" />
            <span className="font-mono font-black text-amber-300 text-sm sm:text-base">
              {score}
            </span>
          </div>

          {/* Sound & Pause */}
          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition active:scale-90"
            title={isMuted ? 'Buka Bunyi' : 'Senyap'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={onPause}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition active:scale-90"
            title="Jeda"
          >
            <Pause size={16} />
          </button>
        </div>
      </div>

      {/* Secondary Bar: Combo & Educational Feedback Alert */}
      <div className="flex justify-between items-center pointer-events-none px-1">
        {/* Combo */}
        {combo >= 2 ? (
          <div className="bg-gradient-to-r from-amber-600/90 to-red-600/90 border border-amber-400 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
            <Flame size={14} className="text-yellow-300 fill-yellow-300" />
            <span className="text-xs font-black text-yellow-100 tracking-wide">
              {combo}x KOMBO SIFIR!
            </span>
          </div>
        ) : <div />}

        {/* Feedback text prompt */}
        {feedbackMessage && (
          <div className="bg-slate-950/90 border-2 border-amber-400/80 px-4 py-1 rounded-full text-xs sm:text-sm font-bold text-amber-200 shadow-xl animate-fade-in flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
