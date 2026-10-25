import React, { useState } from 'react';
import { X, Download, Copy, Check, CheckCircle2, Smartphone, ExternalLink, AlertCircle, Share, PlusSquare, Compass, ShieldCheck } from 'lucide-react';
import { installerService } from '../services/installerService';
import { AppIcon } from './AppIcon';

interface PwaGuideModalProps {
  initialPlatform?: 'ANDROID' | 'IOS';
  onClose: () => void;
  onInstallSuccess: () => void;
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
  initialPlatform = 'IOS',
  onClose,
  onInstallSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'ANDROID' | 'IOS'>(initialPlatform);
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const isIframe = installerService.isRunningInIframe();
  const isInApp = installerService.isInAppBrowser();
  const hasPrompt = installerService.hasNativePrompt();

  const handleCopyLink = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleAndroidInstallAction = async () => {
    if (hasPrompt) {
      const res = await installerService.installToAndroidHomeScreen();
      if (res === 'INSTALLED') {
        onInstallSuccess();
        onClose();
      }
      return;
    }
    installerService.openInNativeAndroidChrome();
  };

  const handleIOSWebClipAction = () => {
    installerService.installToIOSHomeScreen();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92dvh] overflow-y-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="text-emerald-400" size={20} />
            <h2 className="text-sm sm:text-base font-black text-white uppercase">
              PASANG APP TULEN (TANPA LOGO CHROME)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Visual Phone Home Screen Mockup with Inline AppIcon */}
        <div className="my-3 p-3 rounded-2xl bg-gradient-to-b from-indigo-950 to-slate-950 border border-indigo-500/40 flex items-center gap-3.5">
          <div className="flex flex-col items-center shrink-0">
            <AppIcon className="w-14 h-14 rounded-2xl ring-2 ring-amber-300 shadow-xl" />
            <span className="text-[10px] font-bold text-white mt-1">Ninja Sifir 3D</span>
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[9px] font-black uppercase">
              <ShieldCheck size={11} /> Ikon WebAPK Tulen (100% Bersih)
            </div>
            <p className="text-xs text-slate-200 font-bold leading-snug">
              Ikon dipasang sebagai Aplikasi Penuh (WebAPK) tanpa lencana kecil Chrome di penjuru ikon!
            </p>
          </div>
        </div>

        {/* Platform Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('ANDROID')}
            className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 border transition ${
              activeTab === 'ANDROID'
                ? 'bg-emerald-600 border-emerald-300 text-white shadow-lg'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <AndroidLogo className="w-4 h-4" />
            <span>Android (WebAPK)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('IOS')}
            className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 border transition ${
              activeTab === 'IOS'
                ? 'bg-white border-white text-slate-950 shadow-lg'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <AppleLogo className="w-4 h-4" />
            <span>iPhone / iPad (iOS)</span>
          </button>
        </div>

        {/* PANDUAN PEMASANGAN iOS SAFARI */}
        {activeTab === 'IOS' ? (
          <div className="p-3.5 bg-slate-800/80 border border-slate-600 rounded-2xl space-y-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-black text-sky-300 uppercase">
              <Compass size={16} className="text-sky-400 shrink-0" />
              <span>Panduan Pemasangan iOS (Safari)</span>
            </div>

            <div className="space-y-2 text-xs text-slate-200">
              <div className="flex items-center gap-3 bg-slate-950/90 p-2.5 rounded-xl border border-slate-700/80">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-300 flex items-center justify-center shrink-0 font-black">
                  1
                </div>
                <div className="flex-1 text-[11px] leading-snug">
                  Buka halaman ini di pelayar <strong>Safari</strong>, kemudian tekan ikon <strong>&quot;Share&quot; (Kongsi)</strong> di bahagian bawah skrin.
                </div>
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-600 text-sky-400 shrink-0">
                  <Share size={18} />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/90 p-2.5 rounded-xl border border-slate-700/80">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-300 flex items-center justify-center shrink-0 font-black">
                  2
                </div>
                <div className="flex-1 text-[11px] leading-snug">
                  Tatal menu ke bawah dan pilih <strong>&quot;Add to Home Screen&quot; (Tambah ke Skrin Utama)</strong>.
                </div>
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-600 text-emerald-400 shrink-0">
                  <PlusSquare size={18} />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/90 p-2.5 rounded-xl border border-slate-700/80">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-300 flex items-center justify-center shrink-0 font-black">
                  3
                </div>
                <div className="flex-1 text-[11px] leading-snug">
                  Tekan butang <strong>&quot;Add&quot; (Tambah)</strong> di penjuru atas kanan. Ikon <strong>Ninja Sifir 3D</strong> akan muncul tanpa sebarang logo pelayar!
                </div>
                <span className="px-2 py-1 rounded bg-sky-600 text-white font-black text-[10px] shrink-0">
                  Add
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-700/80">
              <button
                type="button"
                onClick={handleIOSWebClipAction}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-700/80 hover:bg-slate-600 active:scale-95 text-slate-100 font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
              >
                <Download size={14} />
                <span>Atau Muat Turun Profil Ikon WebClip (.mobileconfig)</span>
              </button>
            </div>
          </div>
        ) : (
          /* PANDUAN & PEMASANGAN ANDROID TANPA LOGO CHROME */
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-2.5 mb-3">
            {(isIframe || isInApp) && !hasPrompt && (
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-start gap-2 text-[11px] text-amber-200">
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Mod Pratonton Dikesan:</strong> Sila buka di dalam <strong>Google Chrome</strong> penuh supaya Android dapat membina pakej <strong>WebAPK (Tanpa Logo Chrome)</strong>.
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleAndroidInstallAction}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition"
            >
              {hasPrompt ? (
                <>
                  <Smartphone size={18} />
                  <span>INSTALL APP PENUH SEKARANG (TIADA LOGO CHROME)</span>
                </>
              ) : (
                <>
                  <ExternalLink size={18} />
                  <span>BUKA DI CHROME & INSTALL WEBAPK</span>
                </>
              )}
            </button>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1 leading-relaxed">
              <div className="font-black text-amber-300">
                💡 Cara Pastikan Tiada Logo Kecil Chrome Pada Ikon:
              </div>
              <p>
                1. <strong>Buang (Remove)</strong> dahulu ikon lama yang ada logo Chrome dari skrin telefon anda.
              </p>
              <p>
                2. Tekan butang hijau di atas atau pilih <strong>&quot;Install app / Pasang aplikasi&quot;</strong> pada menu Chrome (bukan sekadar pintasan biasa).
              </p>
              <p>
                3. Tunggu mesej <em>&quot;Installing Ninja Sifir 3D...&quot;</em> siap — ikon yang terhasil adalah <strong>100% ikon game tulen tanpa logo Chrome</strong>!
              </p>
            </div>
          </div>
        )}

        {/* Copy Link Box */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            Salin Pautan Aplikasi (Untuk Dibuka di Safari / Chrome):
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Disalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm tracking-wide transition"
        >
          KEMBALI KE PERMAINAN
        </button>
      </div>
    </div>
  );
};
