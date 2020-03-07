import {
  AstroTypes,
  Buildings,
  Defenses,
  Ships,
  Technologies,
  Terrains,
} from './types';
import {
  astrosConfig,
  buildOrderConfig,
  defensesConfig,
  structuresConfig,
  technologiesConfig,
} from './gameConfig';
import { Player } from './player';
import { Fleet } from './fleet';

interface Production {
  ship: Ships;
  end: Date;
}

interface Construction {
  building?: Buildings;
  defense?: Defenses;
  end: Date;
}

interface Researching {
  research: Technologies;
  end: Date;
}

export class Base {
  private metal: number;
  private crystal: number;
  private baseFertility: number;
  private fertility: number;
  private baseArea: number;
  private area: number;
  private usedArea: number;
  private population: number;
  private usedPopulation: number;
  private energy: number;
  private usedEnergy: number;
  private construction: number;
  public production: number;
  public research: number;
  private solar: number;
  private gas: number;
  public isReaserch: boolean = false;
  public economy: number = 0;
  public income: number = 0;
  public trades: number = 0;
  public longDistanceTrades: number = 0;
  public isCapital = false;

  public [Buildings.URBAN_STRUCTURES]: number = 1;
  public [Buildings.SOLAR_PLANTS]: number = 0;
  public [Buildings.GAS_PLANTS]: number = 0;
  public [Buildings.FUSION_PLANTS]: number = 0;
  public [Buildings.ANTIMATTER_PLANTS]: number = 0;
  public [Buildings.ORBITAL_PLANTS]: number = 0;
  public [Buildings.RESEARCH_LABS]: number = 0;
  public [Buildings.METAL_REFINERIES]: number = 0;
  public [Buildings.CRYSTAL_MINES]: number = 0;
  public [Buildings.ROBOTIC_FACTORIES]: number = 0;
  public [Buildings.SHIPYARDS]: number = 0;
  public [Buildings.ORBITAL_SHIPYARDS]: number = 0;
  public [Buildings.SPACEPORTS]: number = 0;
  public [Buildings.COMMAND_CENTERS]: number = 0;
  public [Buildings.NANITE_FACTORIES]: number = 0;
  public [Buildings.ANDROID_FACTORIES]: number = 0;
  public [Buildings.ECONOMIC_CENTERS]: number = 0;
  public [Buildings.TERRAFORM]: number = 0;
  public [Buildings.MULTI_LEVEL_PLATFORMS]: number = 0;
  public [Buildings.ORBITAL_BASE]: number = 0;
  public [Buildings.JUMP_GATE]: number = 0;
  public [Buildings.BIOSPHERE_MODIFICATION]: number = 0;
  public [Buildings.CAPITAL]: number = 0;
  public [Defenses.MISSILE_TURRETS]: number = 0;
  public [Defenses.ION_TURRETS]: number = 0;
  public [Defenses.PHOTON_TURRETS]: number = 0;
  public [Defenses.DISRUPTOR_TURRETS]: number = 0;
  public fleet = new Fleet();
  private currentConstruction: Construction;
  private currentResearch: Researching;
  private currentProduction: Production[] = [];
  public researchBase: boolean = false;

  constructor(
    private terrain: Terrains,
    private type: AstroTypes,
    private position: number,
    private owner: Player,
    private homePlanet = false,
  ) {
    if (terrain === Terrains.ASTEROID && type === AstroTypes.PLANET) {
      throw new Error('asteroid cant be planet');
    }

    if (homePlanet) {
      this[Buildings.URBAN_STRUCTURES] = 5;
      this[Buildings.SOLAR_PLANTS] = 3;
      this[Buildings.GAS_PLANTS] = 3;
      this[Buildings.RESEARCH_LABS] = 5;
      this[Buildings.METAL_REFINERIES] = 8;
      this[Buildings.ROBOTIC_FACTORIES] = 3;
      this[Buildings.SHIPYARDS] = 8;
      this[Buildings.SPACEPORTS] = 5;
      this.fleet[Ships.FIGHTER] = 1;
      this.researchBase = true;
      this.trades = 2;
      this.economy = 29;
    }

    this.metal = astrosConfig[this.terrain].resources.metal;
    this.crystal = astrosConfig[this.terrain].resources.crystal;
    this.baseFertility = astrosConfig[this.terrain].resources.fertility;
    this.baseArea = astrosConfig[this.terrain].area[this.type];
    this.solar = 6 - this.position;
    this.gas = astrosConfig[this.terrain].resources.gas;
    if (this.position === 1) {
      this.baseFertility--;
    }
    if (this.position === 3) {
      this.baseFertility++;
    }
    if (this.position === 4) {
      this.gas++;
      this.baseFertility++;
    }
    if (this.position === 5) {
      this.gas += 2;
      this.solar++;
    }
  }

  public setResearchBase() {
    this.isReaserch = true;
  }

  public isResearching(tech: Technologies) {
    return this.currentResearch && this.currentResearch.research === tech;
  }

  public getBaseIncome() {
    return (
      this.economy + this.owner.getCapitalCount() * 2 + this.getTradeValue()
    );
  }

  private getTradeValue() {
    const players = this.owner.getTotalPlayersInTrade();
    const sd =
      Math.floor(
        Math.sqrt(this.economy + this.owner.getCapitalCount() * 2) *
          (1 + Math.sqrt(20) / 75 + Math.sqrt(players) / 10),
      ) * this.trades;
    const ld =
      Math.floor(
        Math.sqrt(this.economy + this.owner.getCapitalCount() * 2) *
          (1 + Math.sqrt(2000) / 75 + Math.sqrt(players) / 10),
      ) * this.longDistanceTrades;

    return sd + ld;
  }

  public tick(time: Date): boolean {
    const nextTick = new Date(time.getTime() + 60 * 60 * 1000);
    let constructionDone: boolean;
    let researchDone: boolean;

    this.fertility = this.calculateTotalStat('fertility');
    this.area = this.calculateTotalStat('area');
    this.usedArea = this.calculateUsedStat('area');
    this.population = this.calculateTotalStat('population');
    this.usedPopulation = this.calculateUsedStat('population');
    this.energy = this.calculateTotalStat('energy');
    this.usedEnergy = this.calculateUsedStat('energy');
    this.construction = this.calculateTotalStat('construction');
    this.production = this.calculateTotalStat('production');
    this.research = this.calculateTotalStat('research');

    // Apply queues
    while (this.currentProduction.length) {
      if (this.currentProduction[0].end < time) {
        const production = this.currentProduction.shift();
        this.fleet[Ships.FIGHTER]++;
      } else {
        break;
      }
    }

    if (this.currentConstruction) {
      if (this.currentConstruction.end < time) {
        this[
          this.currentConstruction.building || this.currentConstruction.defense
        ]++;
        // If is building and not defense
        if (this.currentConstruction.building) {
          const stats =
            structuresConfig[this.currentConstruction.building].stats;
          const eco = stats.find(stat => stat.stat === 'economy');
          if (eco) {
            this.economy +=
              eco.type === 'value' ? eco.value : this[eco.fromBase];
          }
        }
        this.currentConstruction = null;
      }
    }

    if (this.currentResearch) {
      if (this.currentResearch.end < time) {
        this.owner.reaserch[this.currentResearch.research]++;
        this.currentResearch = null;
      }
    }
    // Set TRs if possible
    this.doTradeRoutes();

    if (this.owner.bases.length >= 7) {
      this.doProduction(time, nextTick);
    }
    constructionDone = this.doConstruction(time, nextTick);
    researchDone = this.doResearch(time, nextTick);

    return constructionDone && researchDone;
  }

  private doTradeRoutes() {
    const availableTR =
      Math.floor(this[Buildings.SPACEPORTS] / 5) +
      (this[Buildings.SPACEPORTS] > 0 ? 1 : 0);

    let missingTR = availableTR - this.trades - this.longDistanceTrades;

    if (missingTR > 0) {
      if (this.owner.bases.length >= 10) {
        this.trades = 0;
        // LD
        while (missingTR > 0 && this.owner.credits >= 2000) {
          this.owner.credits -= 2000;
          this.longDistanceTrades++;
          missingTR = availableTR - this.trades - this.longDistanceTrades;
        }
      } else {
        while (missingTR > 0 && this.owner.credits >= 10) {
          this.owner.credits -= 10;
          this.longDistanceTrades++;
          missingTR = availableTR - this.trades - this.longDistanceTrades;
        }
      }
    }
  }

  private doProduction(time: Date, nextTick: Date) {
    while (true) {
      let lastProd = this.currentProduction.length
        ? this.currentProduction[this.currentProduction.length - 1]
        : null;
      let prodStart = lastProd ? lastProd.end : time;
      const hasCredits = this.owner.credits >= 5;
      const hasTime = prodStart < nextTick;

      if (!hasCredits || !hasTime) {
        break;
      }

      this.owner.credits -= 5;
      this.currentProduction.push({
        end: this.getProductionEndTime(prodStart, 5),
        ship: Ships.FIGHTER,
      });
    }
  }

  private doConstruction(time: Date, nextTick: Date) {
    if (this.isBuildOrderDone(this.owner.bases.length)) {
      return true;
    }

    if (this.currentConstruction && this.currentConstruction.end >= time) {
      return true;
    }

    let constrStart = this.currentConstruction
      ? this.currentConstruction.end
      : time;

    const missingBuildings = this.getMissingBuildings();
    const buildableBuildings = shuffle(
      this.filterHasStatsForBuilding(missingBuildings),
    );

    if (!missingBuildings.length) {
      return true;
    }

    if (buildableBuildings.length) {
      if (this.doesntHaveCreditsForAnyBuilding(buildableBuildings)) {
        return true;
      }
      while (buildableBuildings.length) {
        const building = buildableBuildings.pop();
        const cost = this.calculateBuildingCost(building);

        if (cost <= this.owner.credits) {
          this.owner.credits -= cost;
          const end = this.getConstructionEndTime(constrStart, cost);
          this.currentConstruction = { end, building };
          return end >= nextTick;
        }
      }
    } else {
      // needs area/pop/energy
      if (this.area - this.usedArea <= 0) {
        // AREA
        const areaBuildings = this.getAreaBuildingsByCost();

        if (areaBuildings.length) {
          const cheapest = areaBuildings[0];
          const cost = this.calculateBuildingCost(cheapest);
          if (cost <= this.owner.credits) {
            this.owner.credits -= cost;
            const end = this.getConstructionEndTime(constrStart, cost);
            this.currentConstruction = { end, building: cheapest };
            return end >= nextTick;
          }
        } else {
        }
      } else if (this.population - this.usedPopulation <= 0) {
        const populationBuildings = this.getPopulationBuildingsByEfficiency();
        for (const building of populationBuildings) {
          const cost = this.calculateBuildingCost(building);

          if (cost <= this.owner.credits) {
            this.owner.credits -= cost;
            const end = this.getConstructionEndTime(constrStart, cost);
            this.currentConstruction = { end, building };
            return end >= nextTick;
          }
        }
      } else {
        // ENERGY
        const energyBuildings = this.getEnergyStructuresByEfficiency();
        for (const building of energyBuildings) {
          const cost = this.calculateBuildingCost(building);

          if (cost <= this.owner.credits) {
            this.owner.credits -= cost;
            const end = this.getConstructionEndTime(constrStart, cost);
            this.currentConstruction = { end, building };
            return end >= nextTick;
          }
        }
      }
    }
    return true;
  }

  private doResearch(time: Date, nextTick: Date) {
    const researchStart = this.currentResearch
      ? this.currentResearch.end
      : time;

    if (this.currentResearch && this.currentResearch.end >= time) {
      return true;
    }

    const missingTechs = this.getMissingTechnologies();
    if (missingTechs.length) {
      if (this.doesntHaveCreditsForAnyTech(missingTechs)) {
        return true;
      }

      const researchableTech = shuffle(
        missingTechs.filter(
          t =>
            this.hasTechnologyForTechnology(t) &&
            this.hasResearchLabsForTech(t),
        ),
      );

      if (!researchableTech.length) {
        return true;
      } else {
        while (researchableTech.length) {
          if (this.cantResearchAnyTech(researchableTech)) {
            return true;
          }
          const tech = researchableTech.pop();
          const cost = this.calculateResearchCost(tech);

          if (cost <= this.owner.credits && !this.owner.isResearching(tech)) {
            this.owner.credits -= cost;
            const end = this.getResearchEndTime(researchStart, cost);
            this.currentResearch = { end, research: tech };
            return end >= nextTick;
          }
        }
      }
    } else if (!this.owner.basesToBuild.length) {
      const missingTechs = this.getMissingTechnologies(true);
      if (!this.doesntHaveCreditsForAnyTech(missingTechs)) {
        const researchableTech = shuffle(
          missingTechs.filter(
            t =>
              this.hasTechnologyForTechnology(t) &&
              this.hasResearchLabsForTech(t),
          ),
        );

        if (researchableTech.length) {
          while (researchableTech) {
            if (this.cantResearchAnyTech(researchableTech)) {
              break;
            }
            const tech = researchableTech.pop();
            const cost = this.calculateResearchCost(tech);

            if (cost <= this.owner.credits && !this.owner.isResearching(tech)) {
              this.owner.credits -= cost;
              const end = this.getResearchEndTime(researchStart, cost);
              this.currentResearch = { end, research: tech };
              return end >= nextTick;
            }
          }
        }
      }
    }
    return true;
  }

  private doesntHaveCreditsForAnyBuilding(buildings: Buildings[]) {
    for (const building of buildings) {
      const cost = this.calculateBuildingCost(building);
      if (cost <= this.owner.credits) {
        return false;
      }
    }
    return true;
  }

  private doesntHaveCreditsForAnyTech(technologies: Technologies[]) {
    for (const tech of technologies) {
      const cost = this.calculateResearchCost(tech);
      if (cost <= this.owner.credits) {
        return false;
      }
    }
    return true;
  }

  private cantResearchAnyTech(technologies: Technologies[]) {
    for (const tech of technologies) {
      if (this.owner.isResearching(tech)) {
        return true;
      }
    }
    return false;
  }

  private getHelpfulResearchByCost() {
    let tech = [];

    if (
      this.owner.reaserch[Technologies.ARMOUR] >= 18 &&
      this.owner.reaserch[Technologies.ENERGY] >= 18 &&
      this.owner.reaserch[Technologies.COMPUTER] >= 18
    ) {
      tech.push(Technologies.CYBERNETICS);
    }

    if (
      (this.owner.reaserch[Technologies.ARMOUR] < 22 &&
        this.owner.reaserch[Technologies.ARMOUR] <
          this.owner.reaserch[Technologies.ENERGY]) ||
      (this.owner.reaserch[Technologies.ENERGY] >= 24 &&
        this.owner.reaserch[Technologies.CYBERNETICS] >= 2)
    ) {
      tech.push(Technologies.ARMOUR);
    }

    if (
      this.owner.reaserch[Technologies.ENERGY] < 24 &&
      this.owner.reaserch[Technologies.ENERGY] <
        this.owner.reaserch[Technologies.COMPUTER] + 2
    ) {
      tech.push(Technologies.ENERGY);
    }

    if (
      this.owner.reaserch[Technologies.COMPUTER] < 24 &&
      this.owner.reaserch[Technologies.COMPUTER] <
        this.owner.reaserch[Technologies.ENERGY] + 2
    ) {
      tech.push(Technologies.COMPUTER);
    }

    if (this.owner.reaserch[Technologies.LASER] < 8) {
      tech.push(Technologies.LASER);
    }

    if (
      this.owner.bases.length >= 10 &&
      this.owner.reaserch[Technologies.ARTIFICIAL_INTELLIGENCE] < 6
    ) {
      tech.push(Technologies.ARTIFICIAL_INTELLIGENCE);
    }

    tech = tech
      .filter(
        t =>
          !this.owner.isResearching(t) &&
          this.hasResearchLabsForTech(t) &&
          this.hasTechnologyForTechnology(t),
      )
      .map(t => {
        return {
          technology: t,
          cost: this.calculateResearchCost(t),
        };
      })
      .sort((a, b) => a.cost - b.cost)
      .map(t => t.technology);

    if (!tech.length) {
      return [
        Technologies.ENERGY,
        Technologies.COMPUTER,
        Technologies.ARMOUR,
        Technologies.ARTIFICIAL_INTELLIGENCE,
        Technologies.CYBERNETICS,
      ]
        .filter(
          t =>
            !this.owner.isResearching(t) &&
            this.hasResearchLabsForTech(t) &&
            this.hasTechnologyForTechnology(t),
        )
        .map(t => {
          return {
            technology: t,
            cost: this.calculateResearchCost(t),
          };
        })
        .sort((a, b) => a.cost - b.cost)
        .map(t => t.technology);
    }

    return tech;
  }

  private getResearchableTechsByCost() {
    return [
      Technologies.ENERGY,
      Technologies.COMPUTER,
      Technologies.LASER,
      Technologies.ARMOUR,
      Technologies.ARTIFICIAL_INTELLIGENCE,
      Technologies.CYBERNETICS,
    ]
      .filter(
        t =>
          !this.owner.isResearching(t) &&
          this.hasResearchLabsForTech(t) &&
          this.hasTechnologyForTechnology(t),
      )
      .map(t => {
        return {
          technology: t,
          cost: this.calculateResearchCost(t),
        };
      })
      .sort((a, b) => a.cost - b.cost)
      .map(t => t.technology);
  }

  private getConstructionEndTime(start: Date, cost: number) {
    return new Date(
      start.getTime() + (cost / this.construction) * 60 * 60 * 1000,
    );
  }

  private getProductionEndTime(start: Date, cost: number) {
    return new Date(
      start.getTime() + (cost / this.production) * 60 * 60 * 1000,
    );
  }

  private getResearchEndTime(start: Date, cost: number) {
    return new Date(start.getTime() + (cost / this.research) * 60 * 60 * 1000);
  }

  private calculateBuildingCost(building: Buildings) {
    const level = this[building] + 1;
    const baseCost = structuresConfig[building].baseCost;

    if (level === 1) {
      return baseCost;
    }

    let cost = baseCost * Math.pow(1.5, level - 1);

    if (
      building === Buildings.BIOSPHERE_MODIFICATION &&
      this.type === AstroTypes.MOON &&
      this.terrain !== Terrains.ASTEROID
    ) {
      cost *= 0.75;
    }

    if (
      building === Buildings.BIOSPHERE_MODIFICATION &&
      this.type === AstroTypes.MOON &&
      this.terrain === Terrains.ASTEROID
    ) {
      cost *= 0.5;
    }

    return Math.ceil(cost);
  }

  private calculateResearchCost(technology: Technologies) {
    const level = this.owner.reaserch[technology] + 1;
    const baseCost = technologiesConfig[technology].baseCost;

    if (level === 1) {
      return baseCost;
    }

    return Math.ceil(baseCost * Math.pow(1.5, level - 1));
  }

  private getMissingStatsForBuilding(building: Buildings) {
    const requeriments = structuresConfig[building].requirements.stats;

    return {
      energy: this.energy - this.usedEnergy - requeriments.energy < 0,
      population:
        this.population - this.usedPopulation - requeriments.population < 0,
      area: this.area - this.usedArea - requeriments.area < 0,
    };
  }

  private getMissingTechnologies(next = false) {
    const missingBuildings = this.getMissingBuildings(next);
    if (this.owner.bases.length > 4) {
      missingBuildings.push(Buildings.TERRAFORM);
    }
    if (this.owner.bases.length > 7) {
      missingBuildings.push(Buildings.ORBITAL_BASE);
    }
    if (this.owner.bases.length > 9) {
      missingBuildings.push(Buildings.MULTI_LEVEL_PLATFORMS);
    }
    let missingTechnologies: Technologies[] = [];

    for (const building of missingBuildings) {
      if (!this.hasTechnologyForBuilding(building)) {
        missingTechnologies = [
          ...missingTechnologies,
          ...this.getMissingTechnologiesForBuilding(building),
        ];
      }
    }

    return [...new Set(missingTechnologies)];
  }

  private getMissingDefenses() {
    const order = buildOrderConfig[this.owner.bases.length - 1];
    const buildOrderDefenses = [
      Defenses.DISRUPTOR_TURRETS,
      Defenses.PHOTON_TURRETS,
      Defenses.MISSILE_TURRETS,
      Defenses.ION_TURRETS,
    ];

    const missingDefenses: Defenses[] = [];

    for (const building of buildOrderDefenses) {
      if (this[building] < order[building]) {
        missingDefenses.push(building);
      }
    }

    return missingDefenses;
  }

  private getMissingBuildings(next = false) {
    const order =
      buildOrderConfig[
        next ? this.owner.bases.length : this.owner.bases.length - 1
      ];
    const buildOrderBuildings = [
      Buildings.METAL_REFINERIES,
      Buildings.ROBOTIC_FACTORIES,
      Buildings.SHIPYARDS,
      Buildings.ORBITAL_SHIPYARDS,
      Buildings.NANITE_FACTORIES,
      Buildings.ECONOMIC_CENTERS,
      Buildings.SPACEPORTS,
      Buildings.ANDROID_FACTORIES,
    ];

    if (this.isReaserch) {
      buildOrderBuildings.push(Buildings.RESEARCH_LABS);
    }

    if (this.isCapital) {
      buildOrderBuildings.push(Buildings.CAPITAL);
    }

    if (this.crystal > 0) {
      buildOrderBuildings.push(Buildings.CRYSTAL_MINES);
    }

    const missingBuildings: Buildings[] = [];

    for (const building of buildOrderBuildings) {
      if (this[building] < order[building]) {
        missingBuildings.push(building);
      }
    }

    return missingBuildings;
  }

  private filterHasStatsForBuilding(buildings: Buildings[]) {
    return buildings.filter(b => {
      const missingStats = this.getMissingStatsForBuilding(b);
      return (
        !missingStats.energy && !missingStats.population && !missingStats.area
      );
    });
  }

  private getMissingTechnologiesForBuilding(building: Buildings) {
    const techs = structuresConfig[building].requirements.technologies;
    const missingTechs: Technologies[] = [];

    for (const tech of techs) {
      if (this.owner.reaserch[tech.technology] < tech.level) {
        missingTechs.push(tech.technology);
      }
    }

    return missingTechs;
  }

  private getMissingTechnologiesForDefense(building: Defenses) {
    const techs = defensesConfig[building].requirements.technologies;
    const missingTechs: Technologies[] = [];

    for (const tech of techs) {
      if (this.owner.reaserch[tech.technology] < tech.level) {
        missingTechs.push(tech.technology);
      }
    }

    return missingTechs;
  }

  public isBuildOrderDone(baseCount: number) {
    const order = buildOrderConfig[baseCount - 1];

    if (this[Buildings.METAL_REFINERIES] < order[Buildings.METAL_REFINERIES]) {
      return false;
    }
    if (
      this[Buildings.ROBOTIC_FACTORIES] < order[Buildings.ROBOTIC_FACTORIES]
    ) {
      return false;
    }
    if (this[Buildings.SHIPYARDS] < order[Buildings.SHIPYARDS]) {
      return false;
    }
    if (
      this.crystal > 2 &&
      this[Buildings.CRYSTAL_MINES] < order[Buildings.CRYSTAL_MINES]
    ) {
      return false;
    }
    if (
      this.isReaserch &&
      this[Buildings.RESEARCH_LABS] < order[Buildings.RESEARCH_LABS]
    ) {
      return false;
    }
    if (this[Buildings.NANITE_FACTORIES] < order[Buildings.NANITE_FACTORIES]) {
      return false;
    }
    if (this[Buildings.ECONOMIC_CENTERS] < order[Buildings.ECONOMIC_CENTERS]) {
      return false;
    }
    if (this[Buildings.SPACEPORTS] < order[Buildings.SPACEPORTS]) {
      return false;
    }
    if (
      this[Buildings.ANDROID_FACTORIES] < order[Buildings.ANDROID_FACTORIES]
    ) {
      return false;
    }
    if (this.isCapital && this[Buildings.CAPITAL] < order[Buildings.CAPITAL]) {
      return false;
    }
    return true;
  }

  private getAreaBuildingsByCost() {
    return [Buildings.TERRAFORM, Buildings.MULTI_LEVEL_PLATFORMS]
      .filter(b => this.hasTechnologyForBuilding(b))
      .map(b => {
        const cost = this.calculateBuildingCost(b);
        return {
          building: b,
          cost,
        };
      })
      .sort((a, b) => a.cost - b.cost)
      .map(b => b.building);
  }

  private getAreaCost(building: Buildings) {
    if ((structuresConfig[building].requirements.stats.area || 0) === 0) {
      return 0;
    }
    return Math.round(
      (this.calculateBuildingCost(Buildings.MULTI_LEVEL_PLATFORMS) / 10 +
        this.calculateBuildingCost(Buildings.TERRAFORM) / 5) /
        2,
    );
  }

  private getPopulationCost(building: Buildings) {
    if ((structuresConfig[building].requirements.stats.population || 0) === 0) {
      return 0;
    }
    return Math.round(
      (this.calculateBuildingCost(Buildings.URBAN_STRUCTURES) / this.fertility +
        this.calculateBuildingCost(Buildings.ORBITAL_BASE) / 10 +
        this.calculateBuildingCost(Buildings.BIOSPHERE_MODIFICATION) /
          this[Buildings.URBAN_STRUCTURES]) /
        3,
    );
  }

  private getEnergyStructuresByEfficiency() {
    const energyStructures = [
      Buildings.SOLAR_PLANTS,
      Buildings.GAS_PLANTS,
      Buildings.FUSION_PLANTS,
      Buildings.ANTIMATTER_PLANTS,
      Buildings.ORBITAL_PLANTS,
    ]
      .filter(b => this.hasTechnologyForBuilding(b))
      .map(b => {
        const energyStats = structuresConfig[b].stats.find(
          s => s.stat === 'energy',
        );
        let energyProvided;
        if (energyStats.type === 'base') {
          energyProvided = this[energyStats.fromBase];
        } else {
          energyProvided = energyStats.value;
        }
        const cost = this.calculateBuildingCost(b);
        return {
          building: b,
          cost,
          costPerEnergy:
            (cost + this.getAreaCost(b) + this.getPopulationCost(b)) /
            energyProvided,
        };
      })
      .sort((a, b) => a.costPerEnergy - b.costPerEnergy);

    return energyStructures.map(b => b.building);
  }

  private getPopulationBuildingsByEfficiency() {
    return [
      Buildings.URBAN_STRUCTURES,
      Buildings.BIOSPHERE_MODIFICATION,
      Buildings.ORBITAL_BASE,
    ]
      .filter(b => this.hasTechnologyForBuilding(b))
      .map(b => {
        const cost = this.calculateBuildingCost(b);
        let population;
        const populationStats = structuresConfig[b].stats[0];
        if (b === Buildings.BIOSPHERE_MODIFICATION) {
          population = this[Buildings.URBAN_STRUCTURES];
        } else {
          if (populationStats.type === 'base') {
            population = this[populationStats.fromBase];
          } else {
            population = this[populationStats.value];
          }
        }
        return {
          building: b,
          cost,
          efficiency: population / cost,
        };
      })
      .sort((a, b) => a.efficiency - b.efficiency)
      .map(b => b.building);
  }

  private calculateTotalStat(
    s:
      | 'area'
      | 'population'
      | 'energy'
      | 'fertility'
      | 'construction'
      | 'production'
      | 'research',
  ) {
    let total = 0;

    for (const building of Object.values(Buildings)) {
      for (const stat of structuresConfig[building].stats) {
        if (stat.stat === s) {
          if (stat.type === 'value') {
            total += stat.value * this[building];
          } else {
            total += this[stat.fromBase] * this[building];
          }
        }
      }
    }

    switch (s) {
      case 'area':
        total += this.baseArea;
        break;
      case 'energy':
        total += 2; // TODO: config
        total *= Math.round(
          1 + 0.05 * this.owner.reaserch[Technologies.ENERGY],
        );
        break;
      case 'population':
        break;
      case 'fertility':
        total += this.baseFertility;
        break;
      case 'construction':
        total += this.homePlanet ? 40 : 20;
        break;
      case 'production':
        total *= 1 + this.owner.reaserch[Technologies.CYBERNETICS] * 0.05;
        break;
      case 'research':
        total *=
          1 + this.owner.reaserch[Technologies.ARTIFICIAL_INTELLIGENCE] * 0.05;
    }

    return Math.floor(total);
  }

  private calculateUsedStat(s: 'energy' | 'population' | 'area') {
    let used = 0;
    for (const building of Object.values(Buildings)) {
      used += this[building] * structuresConfig[building].requirements.stats[s];
    }

    return used;
  }

  private hasTechnologyForBuilding(building: Buildings) {
    const requirements = structuresConfig[building].requirements.technologies;

    for (const req of requirements) {
      if (req.level > this.owner.reaserch[req.technology]) {
        return false;
      }
    }

    return true;
  }

  private hasResearchLabsForTech(tech: Technologies) {
    const labs = technologiesConfig[tech].requirements.researchLabs;
    return this[Buildings.RESEARCH_LABS] >= labs;
  }

  private hasTechnologyForTechnology(tech: Technologies) {
    const requirements = technologiesConfig[tech].requirements.technologies;

    for (const req of requirements) {
      if (req.level > this.owner.reaserch[req.technology]) {
        return false;
      }
    }

    return true;
  }

  private hasTechnologyForDefense(building: Defenses) {
    const requirements = defensesConfig[building].requirements.technologies;

    for (const req of requirements) {
      if (req.level > this.owner.reaserch[req.technology]) {
        return false;
      }
    }

    return true;
  }
}

function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
