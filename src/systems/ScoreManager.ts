export class ScoreManager {
  private score: number = 0;
  private hits: number = 0;
  private totalTargets: number = 0;
  private arrowsLeft: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  private shotsSinceLastHit: number = 0;

  constructor(totalTargets: number, arrowCount: number) {
    this.totalTargets = totalTargets;
    this.arrowsLeft = arrowCount;
  }

  registerHit(distanceFromCenter: number, targetScale: number, multiplier: number = 1, countAsHit: boolean = true): number {
    if (countAsHit) this.hits++;
    this.combo++;
    this.shotsSinceLastHit = 0;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const accuracyBonus = Math.max(0, 100 - distanceFromCenter * 2);
    const scaleBonus = Math.round((1 / targetScale) * 50);
    const comboMultiplier = Math.min(this.combo, 5); // max x5
    const points = Math.round((accuracyBonus + scaleBonus) * comboMultiplier * multiplier);
    this.score += points;
    return points;
  }

  registerBombHit(): void {
    this.combo = 0;
    this.score = Math.max(0, this.score - 200);
  }

  registerMiss(): void {
    this.shotsSinceLastHit++;
    if (this.shotsSinceLastHit >= 1) {
      this.combo = 0;
    }
  }

  useArrow(): void {
    this.arrowsLeft = Math.max(0, this.arrowsLeft - 1);
  }

  getScore(): number { return this.score; }
  getHits(): number { return this.hits; }
  getTotalTargets(): number { return this.totalTargets; }
  getArrowsLeft(): number { return this.arrowsLeft; }
  getCombo(): number { return this.combo; }
  getMaxCombo(): number { return this.maxCombo; }

  isLevelComplete(): boolean {
    return this.hits >= this.totalTargets;
  }

  isGameOver(): boolean {
    return this.arrowsLeft <= 0 && this.hits < this.totalTargets;
  }
}
