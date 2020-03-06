import { Base } from './base';
import { Research } from './research';
import { AstroTypes, Buildings, Ships, Technologies, Terrains } from './types';

interface BaseStrategy {
  (number): { type: AstroTypes; terrain: Terrains; position: number };
}

export class Player {
  public credits = 5;
  public bases: Base[] = [];
  public reaserch: Research = new Research();
  public basesToBuild = [];
  constructor(private startTick: Date, public strategy: BaseStrategy) {
    this.bases.push(
      new Base(Terrains.EARTHLY, AstroTypes.PLANET, 3, this, true),
    );

    this.basesToBuild.push({
      end: new Date(startTick.getTime() + 60 * 60 * 1000),
    });
  }

  public isResearching(tech: Technologies) {
    for (const base of this.bases) {
      if (base.isResearching(tech)) {
        return true;
      }
    }

    return false;
  }

  public getTotalPlayersInTrade() {
    let total = 1;

    for (const base of this.bases) {
      total += base.trades + base.longDistanceTrades;
    }

    return total;
  }

  private isBuildOrderDone() {
    for (const base of this.bases) {
      if (!base.isBuildOrderDone(this.bases.length)) {
        return false;
      }
    }

    return true;
  }

  public tick(time: Date) {
    if (this.basesToBuild.length) {
      const cost = this.getNextBaseCost();
      if (this.basesToBuild[0].end <= time && cost <= this.credits) {
        this.credits -= cost;
        const baseData = this.strategy(this.bases.length);
        this.bases.push(
          new Base(baseData.terrain, baseData.type, baseData.position, this),
        );
        if (this.bases.length === 10) {
          this.bases[1].setResearchBase();
        }
        if (this.bases.length === 10) {
          this.bases[3].isCapital = true;
        }
        this.basesToBuild.shift();
      } else {
        // console.log('WAITING FOR CREDS');
      }
    }

    if (
      this.isBuildOrderDone() &&
      !this.basesToBuild.length &&
      this.credits > 100
    ) {
      this.credits -= 100;
      this.basesToBuild.push({
        end: new Date(time.getTime() + 60 * 60 * 4000),
      });
    }

    let pendingBases = [...this.bases];

    while (pendingBases.length) {
      let newPendingBases = [];

      for (const base of pendingBases) {
        const done = base.tick(time);
        if (!done) {
          newPendingBases.push(base);
        }
      }

      pendingBases = newPendingBases;
    }

    // Apply income
    const economy = this.getPlayerEconomy();
    const fleetMaintenance = this.getFleetMaintenance(economy);
    const income = economy - fleetMaintenance;
    this.credits += income;
  }

  public getFleetMaintenance(economy: number) {
    const fleet = this.getFleetValue();
    const freeFleet = Math.pow(economy, 1.6) + Math.pow(economy / 100, 3.2);
    const maxFleetMaintenance = Math.round(economy * 0.3);
    const fleetAboveLimit = freeFleet < fleet ? fleet - freeFleet : 0;

    return Math.min(maxFleetMaintenance, Math.pow(fleetAboveLimit / 125, 0.7)); // TODO:
  }

  public getCapitalCount() {
    if (this.bases[3] && this.bases[3].isCapital) {
      return this.bases[3][Buildings.CAPITAL];
    } else {
      return 0;
    }
  }

  private getNextBaseCost() {
    const costs = [
      100,
      200,
      500,
      1000,
      2000,
      5000,
      10000,
      20000,
      50000,
      100000,
      200000,
      500000,
      1000000,
      2000000,
      5000000,
      10000000,
      20000000,
      50000000,
    ];

    return costs[this.bases.length - 1];
  }

  public getPlayerEconomy() {
    let total = 0;
    for (const base of this.bases) {
      total += base.getBaseIncome();
    }
    return total;
  }

  public getProductionCap() {
    let total = 0;
    for (const base of this.bases) {
      total += base.production;
    }
    return total;
  }

  public getResearchCap() {
    let total = 0;
    for (const base of this.bases) {
      total += base.research;
    }
    return total;
  }

  public getFleetValue() {
    let total = 0;
    for (const base of this.bases) {
      total += base.fleet[Ships.FIGHTER] * 5;
    }
    return total;
  }
}
