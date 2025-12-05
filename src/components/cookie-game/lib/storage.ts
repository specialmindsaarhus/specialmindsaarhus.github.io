import type { Solution } from './types';

const STORAGE_KEY = 'cookie-game-solutions';

export const storage = {
  saveSolution(solution: Solution): void {
    try {
      const existing = this.getAllSolutions();
      const index = existing.findIndex(s => s.challengeId === solution.challengeId);

      if (index >= 0) {
        // Update existing solution
        existing[index] = {
          ...existing[index],
          algorithm: solution.algorithm,
          completed: solution.completed,
          attempts: existing[index].attempts + 1,
          score: solution.score,
          lastUpdated: Date.now()
        };
      } else {
        // Add new solution
        existing.push({
          ...solution,
          attempts: 1,
          lastUpdated: Date.now()
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (error) {
      console.error('Error saving solution to localStorage:', error);
    }
  },

  getSolution(challengeId: string): Solution | null {
    try {
      const solutions = this.getAllSolutions();
      return solutions.find(s => s.challengeId === challengeId) || null;
    } catch (error) {
      console.error('Error getting solution from localStorage:', error);
      return null;
    }
  },

  getAllSolutions(): Solution[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  clearAllProgress(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  getTotalScore(): number {
    const solutions = this.getAllSolutions();
    return solutions
      .filter(s => s.completed && s.score !== undefined)
      .reduce((total, s) => total + (s.score || 0), 0);
  },

  getCompletedCount(): number {
    const solutions = this.getAllSolutions();
    return solutions.filter(s => s.completed).length;
  }
};
