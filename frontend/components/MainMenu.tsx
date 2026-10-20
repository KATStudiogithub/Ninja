import React from 'react';
import { Play, BookOpen, Target, Infinity as InfinityIcon, BarChart3, Download, Shield, Award, Sparkles } from 'lucide-react';
import { Difficulty, UserStats } from '../types';

interface MainMenuProps {
  stats: UserStats;
  difficulty: Difficulty;
  onSetDifficulty: (d: Difficulty) => void;
  onStartAdventure: () => void;
  onStartTableSelect: () => void;
  onStartWeaknessMode: () => void;
  onStartEndless: () => void;
  onOpenStats: () => void;
  onOpenGuide: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  difficulty,
  onSetDifficulty,
  onStartAdventure,
  onStartTableSelect,
  onStartWeaknessMode,
  onStartEndless,
  onOpenStats,
  onOpenGuide
}) => {
  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none">
      {/* Ninja Sifir Title Banner */}
      <div className="mb-3 sm:mb-5 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/90 border border-indigo-400/50 text-sky-300 text-xs font-bold tracking-widest uppercase mb-2 shadow-lg">
          <Sparkles size={14} className="text-amber-400" /> EDISI 3D ANIMASI PIXAR • OFFLINE PWA
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(239,68,68,0.7)] flex flex-col">
          <span>NINJA SIFIR</span>
          <span className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-sky-400">
            RAGEBOUND 3D
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
          Tewaskan musuh dengan jawapan matematik yang betul! Latihan Sifir 2 hingga 12.
        </p>
      </div>

      {/* Main Mode Buttons */}
      <div className="w-full flex flex-col gap-2.5 sm:gap-3 mb-4">
        {/* Mod Pengembaraan (Primary) */}
        <button
          onClick={onStartAdventure}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-base sm:text-lg tracking-wide shadow-xl shadow-red-600/40 border border-red-300/40 flex items-center justify-center gap-3 transition-transform active:scale-98"
        >
          <Play size={22} className="fill-white" />
          <span>MULA PENGEMBARAAN (10 LEVEL)</span>
        </button>

        {/* Grid for other training modes */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onStartTableSelect}
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center gap-1 transition shadow-md active:scale-95"
          >
            <BookOpen size={20} className="text-amber-400" />
            <span className="font-bold text-xs sm:text-sm">Latihan Sifir Khusus</span>
            <span className="text-[10px] text-slate-400">Pilih Sifir 2 - 12</span>
          </button>

          <button
            onClick={onStartWeaknessMode}
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center gap-1 transition shadow-md active:scale-95"
          >
            <Target size={20} className="text-rose-400" />
            <span className="font-bold text-xs sm:text-sm">Latihan Kelemahan</span>
            <span className="text-[10px] text-slate-400">Fokus Soalan Tersalah</span>
          </button>

          <button
            onClick={onStartEndless}
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center gap-1 transition shadow-md active:scale-95"
          >
            <InfinityIcon size={20} className="text-cyan-400" />
            <span className="font-bold text-xs sm:text-sm">Mod Infiniti</span>
            <span className="text-[10px] text-slate-400">Skor Tanpa Had</span>
          </button>

          <button
            onClick={onOpenStats}
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center gap-1 transition shadow-md active:scale-95"
          >
            <BarChart3 size={20} className="text-emerald-400" />
            <span className="font-bold text-xs sm:text-sm">Prestasi Sifir</span>
            <span className="text-[10px] text-slate-400">Analisis Ketepatan</span>
          </button>
        </div>
      </div>

      {/* Difficulty Setting Switch */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 font-bold">Tahap Kesukaran:</span>
        <div className="flex gap-1">
          {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => onSetDifficulty(d)}
              className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                difficulty === d
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {d === 'EASY' ? 'Mudah (-10)' : d === 'NORMAL' ? 'Normal (-20)' : 'Sukar (-30)'}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent Link & Download Button */}
      <button
        onClick={onOpenGuide}
        className="w-full py-2.5 px-4 mb-3 rounded-xl bg-gradient-to-r from-indigo-900/90 to-slate-900 border border-indigo-500/60 hover:border-indigo-400 text-indigo-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
      >
        <Download size={16} className="text-sky-400 animate-bounce" />
        <span>PAUTAN MAIN (LINK), DOWNLOAD & PASANG KE TELEFON</span>
      </button>

      {/* High score footer */}
      <div className="flex items-center justify-between w-full text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
          <Award size={15} />
          <span>Skor Tertinggi: {stats.highScore}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
          <Shield size={14} />
          <span>Sedia Dimainkan Luar Talian</span>
        </div>
      </div>
    </div>
  );
};