import React, { useState } from 'react';
import { Play, BookOpen, Target, Infinity as InfinityIcon, BarChart3, Download, Shield, Award, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { Difficulty, UserStats } from '../types';
import { installerService } from '../services/installerService';

interface MainMenuProps {
  stats: UserStats;
  difficulty: Difficulty;
  isInstalled: boolean;
  hasNativePrompt: boolean;
  onSetDifficulty: (d: Difficulty) => void;
  onStartAdventure: () => void;
  onStartTableSelect: () => void;
  onStartWeaknessMode: () => void;
  onStartEndless: () => void;
  onOpenStats: () => void;
  onInstallSuccess: () => void;
}

const AndroidIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.523 15.3414C16.9606 15.3414 16.5046 14.8854 16.5046 14.3229C16.5046 13.7605 16.9606 13.3045 17.523 13.3045C18.0855 13.3045 18.5415 13.7605 18.5415 14.3229C18.5415 14.8854 18.0855 15.3414 17.523 15.3414ZM6.47702 15.3414C5.91455 15.3414 5.45855 14.8854 5.45855 14.3229C5.45855 13.7605 5.91455 13.3045 6.47702 13.3045C7.03949 13.3045 7.49549 13.7605 7.49549 14.3229C7.49549 14.8854 7.03949 15.3414 6.47702 15.3414ZM17.8879 9.1525L19.9212 5.63063C20.0642 5.38297 19.9794 5.06631 19.7318 4.92329C19.4841 4.78028 19.1674 4.86511 19.0244 5.11277L16.9656 8.67879C15.4957 8.00918 13.8065 7.63354 12 7.63354C10.1935 7.63354 8.50434 8.00918 7.03443 8.67879L4.9756 5.11277C4.83259 4.86511 4.51593 4.78028 4.26827 4.92329C4.02061 5.06631 3.93578 5.38297 4.0788 5.63063L6.11214 9.1525C2.66248 11.0258 0.34082 14.5691 0 18.7385H24C23.6592 14.5691 21.3375 11.0258 17.8879 9.1525Z" />
  </svg>
);

const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.1 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
  </svg>
);

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  difficulty,
  isInstalled,
  onSetDifficulty,
  onStartAdventure,
  onStartTableSelect,
  onStartWeaknessMode,
  onStartEndless,
  onOpenStats,
  onInstallSuccess,
}) => {
  const [installingPlatform, setInstallingPlatform] = useState<'ANDROID' | 'IOS' | null>(null);
  const [installToast, setInstallToast] = useState<string | null>(null);

  const handleOneClickAndroid = async () => {
    setInstallingPlatform('ANDROID');
    setInstallToast('Memulakan pemasangan terus ke Android...');
    const result = await installerService.installAndroidDirect();
    setInstallingPlatform(null);

    if (result === 'INSTALLED') {
      setInstallToast('✅ Berjaya dipasang ke Skrin Utama Android!');
      onInstallSuccess();
    } else if (result === 'PACKAGE_DOWNLOADED') {
      setInstallToast('✅ Pakej App Ninja Sifir 3D dimuat turun! Buka fail untuk terus main.');
    } else {
      setInstallToast(null);
    }
    setTimeout(() => setInstallToast(null), 5000);
  };

  const handleOneClickIOS = () => {
    setInstallingPlatform('IOS');
    setInstallToast('Memuat turun pemasang WebClip iOS...');
    installerService.installIOSDirect();
    setTimeout(() => {
      setInstallingPlatform(null);
      setInstallToast('✅ Pemasang iOS dimuat turun! Tekan "Allow / Benarkan" pada pop-up iPhone.');
      setTimeout(() => setInstallToast(null), 6000);
    }, 600);
  };

  return (
    <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-between px-3 py-2 sm:p-5 text-center select-none overflow-hidden">
      {/* Top Title Banner */}
      <div className="w-full pt-0.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-400/50 text-sky-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1 shadow-md">
          <Sparkles size={12} className="text-amber-400" /> 3D PIXAR • OFFLINE PWA
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(239,68,68,0.7)] flex flex-col leading-none">
          <span>NINJA SIFIR</span>
          <span className="text-lg sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-sky-400 mt-0.5">
            RAGEBOUND 3D
          </span>
        </h1>
        <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5 max-w-xs mx-auto leading-snug">
          Tewaskan musuh jawapan betul! Latihan Sifir 2 hingga 12.
        </p>
      </div>

      {/* Center Action Buttons */}
      <div className="w-full flex flex-col gap-1.5 sm:gap-2 my-auto py-1">
        {/* DIRECT 1-CLICK AUTO-INSTALL PANEL (NO 3-DOTS / NO SHARE MENU NEEDED) */}
        {!isInstalled ? (
          <div className="w-full p-2.5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-2 border-emerald-400/80 shadow-xl shadow-emerald-950/40 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-amber-300 shadow-md shrink-0 bg-indigo-950">
                <img src="public/icon.svg" alt="Ninja Sifir 3D" className="w-full h-full object-cover" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-white truncate">
                    Pasang Terus ke Telefon (1-Klik)
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-400/50 rounded text-[8px] font-black text-emerald-300">
                    AUTO-INSTALL
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate">
                  Klik ikon di bawah untuk terus install tanpa tekan 3 titik / Share:
                </p>
              </div>
            </div>

            {/* 2 Direct 1-Click Hardware Install Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* Direct 1-Click Android Auto-Installer */}
              <button
                type="button"
                onClick={handleOneClickAndroid}
                disabled={installingPlatform === 'ANDROID'}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-white border border-emerald-200 shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 transition"
              >
                {installingPlatform === 'ANDROID' ? (
                  <Loader2 size={18} className="animate-spin text-white shrink-0" />
                ) : (
                  <AndroidIcon className="w-5 h-5 text-white shrink-0" />
                )}
                <div className="text-left leading-none">
                  <div className="text-[8px] font-bold text-emerald-100 uppercase">1-KLIK INSTALL</div>
                  <div className="text-xs font-black tracking-tight mt-0.5">ANDROID</div>
                </div>
                <Download size={14} className="ml-auto shrink-0 stroke-[2.5]" />
              </button>

              {/* Direct 1-Click iOS WebClip Auto-Installer */}
              <button
                type="button"
                onClick={handleOneClickIOS}
                disabled={installingPlatform === 'IOS'}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-white via-slate-100 to-slate-200 hover:from-white hover:to-white active:scale-95 text-slate-950 border border-white shadow-lg flex items-center justify-center gap-2 transition"
              >
                {installingPlatform === 'IOS' ? (
                  <Loader2 size={18} className="animate-spin text-slate-900 shrink-0" />
                ) : (
                  <AppleIcon className="w-5 h-5 text-slate-950 shrink-0" />
                )}
                <div className="text-left leading-none">
                  <div className="text-[8px] font-bold text-slate-600 uppercase">1-KLIK INSTALL</div>
                  <div className="text-xs font-black tracking-tight mt-0.5">iPhone / iOS</div>
                </div>
                <Download size={14} className="ml-auto shrink-0 stroke-[2.5]" />
              </button>
            </div>

            {installToast && (
              <div className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-emerald-400/60 text-[10px] font-bold text-emerald-300 animate-fade-in">
                {installToast}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full py-1.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Aplikasi Telah Siap Dipasang ke Telefon Anda</span>
          </div>
        )}

        {/* Start Adventure Button */}
        <button
          onClick={onStartAdventure}
          className="w-full py-2.5 sm:py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 active:scale-95 text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-red-600/30 border border-red-300/40 flex items-center justify-center gap-2 transition-transform"
        >
          <Play size={18} className="fill-white shrink-0" />
          <span>MULA PENGEMBARAAN (10 LEVEL)</span>
        </button>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <button
            onClick={onStartTableSelect}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 active:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center gap-0.5 transition shadow-md active:scale-95"
          >
            <BookOpen size={17} className="text-amber-400" />
            <span className="font-bold text-xs">Sifir Khusus</span>
            <span className="text-[9px] text-slate-400">Pilih Sifir 2 - 12</span>
          </button>

          <button
            onClick={onStartWeaknessMode}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 active:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center gap-0.5 transition shadow-md active:scale-95"
          >
            <Target size={17} className="text-rose-400" />
            <span className="font-bold text-xs">Latih Kelemahan</span>
            <span className="text-[9px] text-slate-400">Ulang Soalan Salah</span>
          </button>

          <button
            onClick={onStartEndless}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 active:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center gap-0.5 transition shadow-md active:scale-95"
          >
            <InfinityIcon size={17} className="text-cyan-400" />
            <span className="font-bold text-xs">Mod Infiniti</span>
            <span className="text-[9px] text-slate-400">Skor Tanpa Had</span>
          </button>

          <button
            onClick={onOpenStats}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 active:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center gap-0.5 transition shadow-md active:scale-95"
          >
            <BarChart3 size={17} className="text-emerald-400" />
            <span className="font-bold text-xs">Prestasi Sifir</span>
            <span className="text-[9px] text-slate-400">Rekod Ketepatan</span>
          </button>
        </div>

        {/* Difficulty Setting Switch */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 sm:p-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-bold pl-1">Kesukaran:</span>
          <div className="flex gap-1">
            {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onSetDifficulty(d)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition ${
                  difficulty === d
                    ? 'bg-red-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {d === 'EASY' ? 'Mudah' : d === 'NORMAL' ? 'Normal' : 'Sukar'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex items-center justify-between w-full text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-1 text-amber-300 font-bold">
          <Award size={14} />
          <span>Skor Tertinggi: {stats.highScore}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
          <Shield size={13} />
          <span>100% Offline</span>
        </div>
      </div>
    </div>
  );
};
