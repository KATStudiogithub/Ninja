import React from 'react';
import { X, CheckCircle2, AlertTriangle, Trophy } from 'lucide-react';
import { UserStats } from '../types';

interface StatsModalProps {
  stats: UserStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const total = stats.totalCorrect + stats.totalWrong;
  const accuracy = total > 0 ? Math.round((stats.totalCorrect / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={20} />
            <h2 className="text-lg font-black text-white">ANALISIS PRESTASI SIFIR</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Ketepatan</div>
            <div className="text-xl font-black text-emerald-400">{accuracy}%</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Jumlah Betul</div>
            <div className="text-xl font-black text-amber-400">{stats.totalCorrect}</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Level Terbuka</div>
            <div className="text-xl font-black text-cyan-400">{stats.levelsUnlocked}/10</div>
          </div>
        </div>

        {/* Breakdown for Sifir 2 through 12 */}
        <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
          Penguasaan Sifir 2 hingga 12:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((table) => {
            const tableData = stats.tableStats[table] || { correct: 0, wrong: 0 };
            const tableTotal = tableData.correct + tableData.wrong;
            const pct = tableTotal > 0 ? Math.round((tableData.correct / tableTotal) * 100) : 0;
            const isWeak = tableData.wrong > 2 && pct < 60;

            return (
              <div
                key={table}
                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isWeak ? 'bg-red-950/40 border-red-700/60' : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div>
                  <div className="font-black text-sm text-white">Sifir {table}</div>
                  <div className="text-[10px] text-slate-400">
                    Betul: {tableData.correct} | Salah: {tableData.wrong}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${isWeak ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tableTotal > 0 ? `${pct}%` : 'Belum cuba'}
                  </span>
                  {isWeak ? (
                    <AlertTriangle size={14} className="text-red-400" title="Perlu latihan" />
                  ) : tableTotal > 0 && pct >= 80 ? (
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide transition"
        >
          TUTUP
        </button>
      </div>
    </div>
  );
};
