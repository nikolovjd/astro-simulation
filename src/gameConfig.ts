import {
  BaseStats,
  Buildings,
  Technologies,
  Terrains,
  Ships,
  Defenses,
  Weapons,
} from './types';
const astros = require('../config/astros.json');
const ships = require('../config/ships.json');
const structures = require('../config/structures.json');
const technologies = require('../config/technologies.json');
const defenses = require('../config/defenses.json');
const buildOrder = require('../config/buildOrder.json');

interface TechnologyRequirement {
  technology: Technologies;
  level: number;
}

interface StructureRequirementStats {
  energy: number;
  population: number;
  area: number;
}

interface StructureRequirements {
  stats: StructureRequirementStats;
  technologies: TechnologyRequirement[];
}

interface StructureProvidedStats {
  stat: string;
  type: 'base' | 'value';
  value?: number;
  fromBase?: BaseStats;
}

interface StructureStats {
  baseCost: number;
  requirements: StructureRequirements;
  stats: StructureProvidedStats[];
}

type GameConfigStructures = {
  [key in Buildings]?: StructureStats;
};

interface AstrosConfigResources {
  metal: number;
  gas: number;
  crystal: number;
  fertility: number;
}

interface AstrosConfigArea {
  moon: number;
  planet: number;
}

interface AstroStats {
  resources: AstrosConfigResources;
  area: AstrosConfigArea;
}

interface TechnologyRequirements {
  researchLabs: number;
  technologies: TechnologyRequirement[];
}

interface ShipRequirements {
  shipyards: number;
  orbitalShipyards: number;
  technologies: TechnologyRequirement[];
}

interface TechnologyStats {
  baseCost: number;
  requirements: TechnologyRequirements;
}

interface ShipStats {
  baseCost: number;
  requirements: ShipRequirements;
}

interface DefenseStats {
  baseCost: number;
  weapon: Weapons;
  requirements: StructureRequirements;
  stats: StructureProvidedStats[];
}

type GameConfigDefenses = {
  [key in Defenses]?: DefenseStats;
};

type GameConfigTechnologies = {
  [key in Technologies]: TechnologyStats;
};

type GameConfigAstros = {
  [key in Terrains]: AstroStats;
};

type GameConfigShips = {
  [key in Ships]: ShipStats;
};

interface BuildOrder {
  [Buildings.METAL_REFINERIES]: number;
  [Buildings.ROBOTIC_FACTORIES]: number;
  [Buildings.SHIPYARDS]: number;
  [Buildings.ORBITAL_SHIPYARDS]?: number;
  [Buildings.NANITE_FACTORIES]?: number;
  [Buildings.ECONOMIC_CENTERS]?: number;
  [Buildings.SPACEPORTS]: number;
  [Buildings.ANDROID_FACTORIES]?: number;
  [Buildings.RESEARCH_LABS]?: number;
  [Buildings.CAPITAL]?: number;
  [Ships.FIGHTER]: number;
  [Defenses.MISSILE_TURRETS]?: number;
  [Defenses.ION_TURRETS]?: number;
  [Defenses.PHOTON_TURRETS]?: number;
  [Defenses.DISRUPTOR_TURRETS]?: number;
}

export const structuresConfig = structures as GameConfigStructures;
export const technologiesConfig = technologies as GameConfigTechnologies;
export const astrosConfig = astros as GameConfigAstros;
export const shipsConfig = ships as GameConfigShips;
export const defensesConfig = defenses as GameConfigDefenses;
export const buildOrderConfig = buildOrder as BuildOrder[];
