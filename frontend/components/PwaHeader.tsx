import React from 'react';
import { Smartphone, CheckCircle2, Volume2, VolumeX, BarChart3, Shield } from 'lucide-react';

interface PwaHeaderProps {
  isInstalled: boolean;
  hasNativePrompt: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenStats: () => void;
  onInstallClick: () => void;
}

export const PwaHeader: React.FC<PwaHeaderProps> = ({
  isInstalled,
  hasNativePrompt,
  isMuted,
  onToggleMute,
  onOpenStats,
  onInstallClick,
}) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/90 px-3 sm:px-6 py-2 flex items-center justify-between z-30 shrink-0 shadow-lg">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-indigo-950">
          <img src="public/icon.svg" alt="Ninja Sifir 3D" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col text-left leading-tight truncate">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xs sm:text-sm text-white tracking-wide truncate">
              NINJA SIFIR 3D
            </span>
            <span className="hidden xs:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-bold text-emerald-300">
              <Shield size={9} /> PWA
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium truncate">
            Math Ninja • Sifir 2 - 12 Offline
          </span>
        </div>
      </div>

      {/* Navigation Actions & 'Pasang App' Button */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenStats}
          className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
          title="Prestasi Sifir"
          aria-label="Prestasi Sifir"
        >
          <BarChart3 size={16} className="text-amber-400" />
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
          title={isMuted ? 'Buka Bunyi' : 'Senyap'}
          aria-label="Kawalan Bunyi"
        >
          {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-sky-400" />}
        </button>

        {/* Butang 'Pasang App' dengan Ikon Telefon Pintar */}
        {!isInstalled ? (
          <button
            type="button"
            onClick={onInstallClick}
            className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-600/30 border border-emerald-300/70 flex items-center gap-1.5 transition"
          >
            <Smartphone size={16} className="stroke-[2.5] shrink-0 animate-bounce" />
            <span>Pasang App</span>
            {hasNativePrompt && (
              <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
            )}
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">App Terpasang</span>
          </div>
        )}
      </div>
    </header>
  );
};
