export class ScoreManager {
  private score: number = 0;
  private hits: number = 0;
  private totalTargets: number = 0;
  private arrowsLeft: number = 0;

  constructor(totalTargets: number, arrowCount: number) {
    this.totalTargets = totalTargets;
    this.arrowsLeft = arrowCount;
  }

  registerHit(distanceFromCenter: number, targetScale: number): number {
    this.hits++;
    // Closer to center = more points, smaller target = more points
    const accuracyBonus = Math.max(0, 100 - distanceFromCenter * 2);
    const scaleBonus = Math.round((1 / targetScale) * 50);
    const points = Math.round(accuracyBonus + scaleBonus);
    this.score += points;
    return points;
  }

  useArrow(): void {
    this.arrowsLeft = Math.max(0, this.arrowsLeft - 1);
  }

  getScore(): number { return this.score; }
  getHits(): number { return this.hits; }
  getTotalTargets(): number { return this.totalTargets; }
  getArrowsLeft(): number { return this.arrowsLeft; }

  isLevelComplete(): boolean {
    return this.hits >= this.totalTargets;
  }

  isGameOver(): boolean {
    return this.arrowsLeft <= 0 && this.hits < this.totalTargets;
  }
}
