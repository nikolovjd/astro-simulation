import { AstroTypes, Technologies, Terrains } from './types';
import { Player } from './player';

interface BaseStrategy {
  (number): { type: AstroTypes; terrain: Terrains; position: number };
}

const asteroidStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.ASTEROID,
  position: p,
}));

const rockyMoonStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.ROCKY,
  position: p,
}));

const rockyPlanetStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.PLANET,
  terrain: Terrains.ROCKY,
  position: p,
}));

const gaiaMoonStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.GAIA,
  position: p,
}));

const gaiaPlanetStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.PLANET,
  terrain: Terrains.GAIA,
  position: p,
}));

const crystalMoonStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.CRYSTALLINE,
  position: p,
}));

const crystalPlanetStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.PLANET,
  terrain: Terrains.CRYSTALLINE,
  position: p,
}));

const earthlyMoonStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.EARTHLY,
  position: p,
}));

const earthlyPlanetStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.PLANET,
  terrain: Terrains.EARTHLY,
  position: p,
}));

const metallicMoonStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.METALLIC,
  position: p,
}));

const metallicPlanetStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.PLANET,
  terrain: Terrains.METALLIC,
  position: p,
}));

const oceanicMoonStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.OCEANIC,
  position: p,
}));

const oceanicPlanetStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.PLANET,
  terrain: Terrains.OCEANIC,
  position: p,
}));

const toxicMoonStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.TOXIC,
  position: p,
}));

const toxicPlanetStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.PLANET,
  terrain: Terrains.TOXIC,
  position: p,
}));

const volcanicMoonStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.VOLCANIC,
  position: p,
}));

const volcanicPlanetStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.PLANET,
  terrain: Terrains.VOLCANIC,
  position: p,
}));

const radioactiveMoonStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.RADIOACTIVE,
  position: p,
}));

const radioactivePlanetStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.PLANET,
  terrain: Terrains.RADIOACTIVE,
  position: p,
}));

const tundraMoonStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.TUNDRA,
  position: p,
}));

const tundraPlanetStrategies = [1, 2, 3, 4, 5].map(p => (n: number) => ({
  type: AstroTypes.PLANET,
  terrain: Terrains.TUNDRA,
  position: p,
}));

const strategySets = [
  asteroidStrategies,
  crystalMoonStrategies,
  crystalPlanetStrategies,
  tundraMoonStrategies,
  tundraPlanetStrategies,
  rockyMoonStrategies,
  rockyPlanetStrategies,
  gaiaMoonStrategies,
  gaiaPlanetStrategies,
  volcanicMoonStrategies,
  volcanicPlanetStrategies,
  radioactiveMoonStrategies,
  radioactivePlanetStrategies,
  oceanicMoonStrategies,
  oceanicPlanetStrategies,
  earthlyMoonStrategies,
  earthlyPlanetStrategies,
  toxicMoonStrategies,
  toxicPlanetStrategies,
  metallicMoonStrategies,
  metallicPlanetStrategies,
];

for (const strategySet of strategySets) {
  for (const strat of strategySet) {
    console.log(strat(1));

    const date = new Date();
    const players: Player[] = [];
    const agents = 10;

    for (let i = 0; i < agents; i++) {
      const player = new Player(date, strat);
      players.push(player);
    }

    for (let x = 1; x <= 24 * 360; x++) {
      const tick = new Date(date.getTime() + 60 * 60 * 1000 * x);
      for (const player of players) {
        player.tick(tick);
      }

      if (
        x === 7 * 24 ||
        x === 14 * 24 ||
        x === 30 * 24 ||
        x === 60 * 24 ||
        x === 90 * 24 ||
        x === 180 * 24 ||
        x === 360 * 24
      ) {
        const avgEconomy =
          players.map(p => p.getPlayerEconomy()).reduce((a, b) => a + b, 0) /
          agents;
        const avgBases =
          players.map(p => p.bases.length).reduce((a, b) => a + b, 0) / agents;
        const avgFleet =
          players.map(p => p.getFleetValue()).reduce((a, b) => a + b, 0) /
          agents;
        const avgFleetMaintenance =
          players
            .map(p => p.getFleetMaintenance(p.getPlayerEconomy()))
            .reduce((a, b) => a + b, 0) / agents;

        console.log(
          `Days: ${x /
            24} Eco: ${avgEconomy} Bases: ${avgBases} Maintenance: ${avgFleetMaintenance} Fleet: ${avgFleet}`,
        );
      }
    }
  }
}
