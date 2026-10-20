import { UserStats } from '../types';

const STORAGE_KEY = 'NINJA_SIFIR_RAGEBOUND_DATA_V1';

const defaultStats: UserStats = {
  highScore: 0,
  levelsUnlocked: 1,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  totalWrong: 0,
  tableStats: {
    2: { correct: 0, wrong: 0 },
    3: { correct: 0, wrong: 0 },
    4: { correct: 0, wrong: 0 },
    5: { correct: 0, wrong: 0 },
    6: { correct: 0, wrong: 0 },
    7: { correct: 0, wrong: 0 },
    8: { correct: 0, wrong: 0 },
    9: { correct: 0, wrong: 0 },
    10: { correct: 0, wrong: 0 },
    11: { correct: 0, wrong: 0 },
    12: { correct: 0, wrong: 0 }
  }
};

export class StorageService {
  public static loadStats(): UserStats {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultStats;
      const parsed = JSON.parse(raw);
      return {
        ...defaultStats,
        ...parsed,
        tableStats: {
          ...defaultStats.tableStats,
          ...(parsed.tableStats || {})
        }
      };
    } catch {
      return defaultStats;
    }
  }

  public static saveStats(stats: UserStats): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Gagal menyimpan kemajuan ke localStorage:', e);
    }
  }

  public static recordAnswer(table: number, isCorrect: boolean, currentScore: number): UserStats {
    const stats = this.loadStats();
    stats.totalQuestionsAnswered += 1;
    if (isCorrect) {
      stats.totalCorrect += 1;
    } else {
      stats.totalWrong += 1;
    }

    if (!stats.tableStats[table]) {
      stats.tableStats[table] = { correct: 0, wrong: 0 };
    }

    if (isCorrect) {
      stats.tableStats[table].correct += 1;
    } else {
      stats.tableStats[table].wrong += 1;
    }

    if (currentScore > stats.highScore) {
      stats.highScore = currentScore;
    }

    this.saveStats(stats);
    return stats;
  }

  public static unlockLevel(levelNum: number): UserStats {
    const stats = this.loadStats();
    if (levelNum > stats.levelsUnlocked && levelNum <= 10) {
      stats.levelsUnlocked = levelNum;
      this.saveStats(stats);
    }
    return stats;
  }
}
