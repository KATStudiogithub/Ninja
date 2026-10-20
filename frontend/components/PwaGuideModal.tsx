import React, { useState, useEffect } from 'react';
import { X, Smartphone, WifiOff, Download, Share2, Copy, Check, Globe, FolderDown } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaGuideModalProps {
  onClose: () => void;
}

export const PwaGuideModal: React.FC<PwaGuideModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleCopyLink = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto text-left">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="text-sky-400" size={20} />
            <h2 className="text-base sm:text-lg font-black text-white">
              PAUTAN MAIN (LINK) & MUAT TURUN GAME
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Direct Play Link & 1-Click Install */}
        <div className="my-3 p-3.5 bg-indigo-950/60 border border-indigo-500/50 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-indigo-300 uppercase">
            <Globe size={15} /> 1. Pautan Semasa (Kongsi & Main Terus)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Anda sedang berada di dalam versi penuh permainan yang boleh terus dimainkan! Salin pautan di bawah untuk dibuka dalam pelayar <strong>Safari (iPhone/iPad)</strong> atau <strong>Chrome (Android/PC)</strong>:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono select-all"
            />
            <button
              onClick={handleCopyLink}
              className="shrink-0 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Disalin!' : 'Salin Link'}</span>
            </button>
          </div>

          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Download size={16} />
              <span>PASANG APLIKASI SEKARANG (1-KLIK INSTALL)</span>
            </button>
          )}
        </div>

        {/* 2. Download Source ZIP / Host Free */}
        <div className="mb-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase">
            <FolderDown size={15} /> 2. Cara Download Fail Penuh & Buat Link Sendiri
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Untuk memuat turun keseluruhan kod & grafik 3D permainan ini ke komputer anda:
          </p>
          <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside">
            <li>Tekan butang <strong>Download / Export ZIP</strong> di bahagian atas kanan skrin Google AI Studio ini.</li>
            <li>Untuk mendapatkan pautan tetap (seperti <code>ninjasifir.netlify.app</code>), muat naik folder tersebut secara percuma ke <strong>Netlify Drop (app.netlify.com/drop)</strong> atau <strong>Vercel</strong>.</li>
          </ol>
        </div>

        {/* 3. iPhone & Android Home Screen Install */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="text-xs font-black text-amber-400 flex items-center gap-1.5 mb-1.5">
              <Share2 size={14} /> Pasang di iPhone / iPad
            </h3>
            <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside">
              <li>Buka link permainan di <strong>Safari</strong>.</li>
              <li>Tekan ikon <strong>Share (Kongsi)</strong> di bawah.</li>
              <li>Pilih <strong>"Add to Home Screen"</strong>.</li>
              <li>Buka ikon Ninja Sifir 3D tanpa internet!</li>
            </ol>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="text-xs font-black text-cyan-400 flex items-center gap-1.5 mb-1.5">
              <Download size={14} /> Pasang di Android
            </h3>
            <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside">
              <li>Buka link permainan di <strong>Chrome</strong>.</li>
              <li>Tekan menu tiga titik <strong>(⋮)</strong> di atas kanan.</li>
              <li>Pilih <strong>"Install App" / "Pasang Aplikasi"</strong>.</li>
              <li>Sedia dimainkan 100% offline!</li>
            </ol>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 mb-4 bg-emerald-950/50 border border-emerald-700/50 rounded-xl text-[11px] text-emerald-200">
          <WifiOff size={16} className="shrink-0 text-emerald-400" />
          <span>
            Semua 10 Level, grafik 3D Pixar, kesan bunyi dan rekod prestasi disimpan terus di dalam peranti anda.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide transition"
        >
          KEMBALI KE PERMAINAN
        </button>
      </div>
    </div>
  );
};