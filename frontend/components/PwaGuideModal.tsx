import React, { useState } from 'react';
import { X, WifiOff, Download, Share2, Copy, Check, PlusSquare, MoreVertical } from 'lucide-react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaGuideModalProps {
  initialPlatform?: 'ANDROID' | 'IOS';
  deferredPrompt: BeforeInstallPromptEvent | null;
  onClearPrompt: () => void;
  onClose: () => void;
}

const AndroidLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.523 15.3414C16.9606 15.3414 16.5046 14.8854 16.5046 14.3229C16.5046 13.7605 16.9606 13.3045 17.523 13.3045C18.0855 13.3045 18.5415 13.7605 18.5415 14.3229C18.5415 14.8854 18.0855 15.3414 17.523 15.3414ZM6.47702 15.3414C5.91455 15.3414 5.45855 14.8854 5.45855 14.3229C5.45855 13.7605 5.91455 13.3045 6.47702 13.3045C7.03949 13.3045 7.49549 13.7605 7.49549 14.3229C7.49549 14.8854 7.03949 15.3414 6.47702 15.3414ZM17.8879 9.1525L19.9212 5.63063C20.0642 5.38297 19.9794 5.06631 19.7318 4.92329C19.4841 4.78028 19.1674 4.86511 19.0244 5.11277L16.9656 8.67879C15.4957 8.00918 13.8065 7.63354 12 7.63354C10.1935 7.63354 8.50434 8.00918 7.03443 8.67879L4.9756 5.11277C4.83259 4.86511 4.51593 4.78028 4.26827 4.92329C4.02061 5.06631 3.93578 5.38297 4.0788 5.63063L6.11214 9.1525C2.66248 11.0258 0.34082 14.5691 0 18.7385H24C23.6592 14.5691 21.3375 11.0258 17.8879 9.1525Z" />
  </svg>
);

const AppleLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.1 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
  </svg>
);

export const PwaGuideModal: React.FC<PwaGuideModalProps> = ({
  initialPlatform = 'ANDROID',
  deferredPrompt,
  onClearPrompt,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ANDROID' | 'IOS'>(initialPlatform);
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ninja Sifir: Ragebound 3D',
          text: 'Jom main game Ninja Sifir 3D (Sifir 2 - 12)! Boleh pasang & main offline.',
          url: currentUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    onClearPrompt();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92dvh] overflow-y-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="text-emerald-400" size={20} />
            <h2 className="text-sm sm:text-base font-black text-white uppercase">
              DOWNLOAD GAME KE FON
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Platform Switcher Tabs (Android & iOS) */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <button
            onClick={() => setActiveTab('ANDROID')}
            className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 border transition ${
              activeTab === 'ANDROID'
                ? 'bg-emerald-600 border-emerald-300 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <AndroidLogo className="w-4 h-4" />
            <span>ANDROID</span>
          </button>

          <button
            onClick={() => setActiveTab('IOS')}
            className={`py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 border transition ${
              activeTab === 'IOS'
                ? 'bg-white border-white text-slate-950 shadow-lg'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <AppleLogo className="w-4 h-4" />
            <span>iOS / iPhone</span>
          </button>
        </div>

        {/* ANDROID TAB CONTENT */}
        {activeTab === 'ANDROID' && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3 mb-3">
            <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase">
              <AndroidLogo className="w-5 h-5" />
              <span>Pasang Aplikasi ke Android</span>
            </div>

            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl animate-pulse"
              >
                <Download size={18} />
                <span>TEKAN UNTUK INSTALL SEKARANG (1-KLIK)</span>
              </button>
            ) : (
              <div className="space-y-2 text-xs text-slate-200">
                <p className="text-[11px] text-slate-300">
                  Ikut 3 langkah mudah ini dalam pelayar <strong>Google Chrome</strong>:
                </p>
                <div className="flex items-center gap-2.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center shrink-0">1</div>
                  <div className="text-[11px]">
                    Tekan butang menu <strong>3 Titik</strong> <MoreVertical size={13} className="inline text-emerald-400" /> di penjuru atas kanan Chrome.
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center shrink-0">2</div>
                  <div className="text-[11px]">
                    Pilih <strong>"Install App" (Pasang Aplikasi)</strong> atau <strong>"Add to Home Screen"</strong>.
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center shrink-0">3</div>
                  <div className="text-[11px]">
                    Ikon <strong>Ninja Sifir 3D</strong> akan muncul di skrin telefon & sedia dimainkan tanpa internet!
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* iOS / iPHONE TAB CONTENT */}
        {activeTab === 'IOS' && (
          <div className="p-3.5 bg-slate-800/70 border border-slate-500/50 rounded-2xl space-y-3 mb-3">
            <div className="flex items-center gap-2 text-white font-black text-xs uppercase">
              <AppleLogo className="w-5 h-5" />
              <span>Pasang Aplikasi ke iPhone / iPad</span>
            </div>

            <div className="space-y-2 text-xs text-slate-200">
              <p className="text-[11px] text-slate-300">
                Buka pautan permainan ini dalam pelayar <strong>Safari</strong> dan ikut langkah berikut:
              </p>
              <div className="flex items-center gap-2.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-black flex items-center justify-center shrink-0">1</div>
                <div className="text-[11px]">
                  Tekan simbol <strong>Share (Kongsi)</strong> <Share2 size={13} className="inline text-sky-400" /> di bar bawah Safari.
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-black flex items-center justify-center shrink-0">2</div>
                <div className="text-[11px]">
                  Tatal ke bawah dan tekan <strong>"Add to Home Screen" (Tambah ke Skrin Utama)</strong> <PlusSquare size={13} className="inline text-sky-400" />.
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-black flex items-center justify-center shrink-0">3</div>
                <div className="text-[11px]">
                  Tekan <strong>"Add" (Tambah)</strong> di penjuru atas kanan. Siap!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share / Copy Link Box */}
        <div className="p-3 bg-indigo-950/50 border border-indigo-500/40 rounded-xl space-y-2 mb-3">
          <div className="text-[11px] font-bold text-indigo-200">
            Salin atau Hantar Link Game ke WhatsApp / Telefon:
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-[11px] text-slate-300 font-mono select-all"
            />
            <button
              onClick={handleCopyLink}
              className="shrink-0 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Disalin' : 'Salin'}</span>
            </button>
            <button
              onClick={handleNativeShare}
              className="shrink-0 p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition"
              title="Kongsi Link"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 mb-3 bg-slate-950/90 border border-slate-800 rounded-xl text-[11px] text-emerald-300">
          <WifiOff size={15} className="shrink-0 text-emerald-400" />
          <span>
            Selepas ditambah ke skrin utama, game ini berfungsi <strong>100% tanpa internet (Offline)</strong>.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm tracking-wide transition"
        >
          KEMBALI KE PERMAINAN
        </button>
      </div>
    </div>
  );
};
