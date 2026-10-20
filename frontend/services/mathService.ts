import { QuestionData } from '../types';

export class MathService {
  /**
   * Generate a multiplication question from allowed tables.
   */
  public static generateQuestion(
    allowedTables: number[],
    excludeQuestion?: { factor1: number; factor2: number }
  ): QuestionData {
    const validTables = allowedTables.length > 0 ? allowedTables : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    let factor1 = validTables[Math.floor(Math.random() * validTables.length)];
    // factor2 from 2 to 12
    let factor2 = Math.floor(Math.random() * 11) + 2;

    // Avoid immediate duplicate
    if (excludeQuestion && factor1 === excludeQuestion.factor1 && factor2 === excludeQuestion.factor2) {
      factor2 = ((factor2 + 3) % 11) + 2;
    }

    const correctAnswer = factor1 * factor2;

    // Generate 3 unique, plausible distractors
    const distractors = this.generateDistractors(factor1, factor2, correctAnswer, 3);
    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

    return {
      id: `${factor1}x${factor2}-${Date.now()}-${Math.random()}`,
      factor1,
      factor2,
      correctAnswer,
      distractors,
      options
    };
  }

  /**
   * Generates plausible math distractors (e.g., +/- table step, flipped digits, common errors)
   */
  private static generateDistractors(
    factor1: number,
    factor2: number,
    correctAnswer: number,
    count: number
  ): number[] {
    const candidates = new Set<number>();

    // Typical errors:
    // 1. Off by 1 table step: (factor1 * (factor2 + 1)) or (factor1 * (factor2 - 1))
    if (factor2 > 2) candidates.add(factor1 * (factor2 - 1));
    candidates.add(factor1 * (factor2 + 1));

    // 2. Off by +/- 2, 4 or 10
    if (correctAnswer - 2 > 0) candidates.add(correctAnswer - 2);
    candidates.add(correctAnswer + 2);
    if (correctAnswer - 4 > 0) candidates.add(correctAnswer - 4);
    candidates.add(correctAnswer + 4);

    // 3. Off by neighbour table
    candidates.add((factor1 + 1) * factor2);
    if (factor1 > 2) candidates.add((factor1 - 1) * factor2);

    // Remove the correct answer if accidentally in set
    candidates.delete(correctAnswer);

    // Convert to array and filter out <= 0
    const list = Array.from(candidates).filter(n => n > 0 && n !== correctAnswer);
    list.sort(() => Math.random() - 0.5);

    const result: number[] = [];
    for (const val of list) {
      if (result.length < count && !result.includes(val)) {
        result.push(val);
      }
    }

    // Fallback if not enough
    let offset = 3;
    while (result.length < count) {
      const candidate = correctAnswer + offset;
      if (candidate !== correctAnswer && !result.includes(candidate) && candidate > 0) {
        result.push(candidate);
      }
      offset = offset > 0 ? -offset - 2 : Math.abs(offset) + 3;
    }

    return result.slice(0, count);
  }

  /**
   * Find tables with highest wrong rate from user statistics
   */
  public static getWeakestTables(tableStats: Record<number, { correct: number; wrong: number }>): number[] {
    const list = Object.entries(tableStats).map(([tableStr, stats]) => {
      const table = parseInt(tableStr, 10);
      const total = stats.correct + stats.wrong;
      const wrongRatio = total > 0 ? stats.wrong / total : 0;
      return { table, wrongRatio, wrongCount: stats.wrong };
    });

    list.sort((a, b) => b.wrongRatio - a.wrongRatio || b.wrongCount - a.wrongCount);
    const weak = list.filter(item => item.wrongCount > 0).map(item => item.table);

    return weak.length > 0 ? weak.slice(0, 4) : [6, 7, 8, 9];
  }
}
