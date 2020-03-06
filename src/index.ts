import { AstroTypes, Technologies, Terrains } from './types';
import { Player } from './player';

interface BaseStrategy {
  (number): { type: AstroTypes; terrain: Terrains; position: number };
}

const strategy = (n: number) => ({
  type: AstroTypes.MOON,
  terrain: Terrains.ASTEROID,
  position: 3,
});

console.log(strategy(1));

const date = new Date();
const players: Player[] = [];
const agents = 1000;

////
const agent = new Player(date, strategy);

console.time('ook');
for (let x = 1; x < 24 * 360; x++) {
  const tick = new Date(date.getTime() + 60 * 60 * 1000 * x);
  agent.tick(tick);
  if (
    x === 7 * 24 ||
    x === 14 * 24 ||
    x === 30 * 24 ||
    x === 60 * 24 ||
    x === 90 * 24 ||
    x === 180 * 24 ||
    x === 360 * 24
  ) {
    console.log('bases: ', agent.bases.length);
    console.log('economy: ', agent.getPlayerEconomy());
    console.log('fleet: ', agent.getFleetValue());
    console.log(
      'maintenance: ',
      agent.getFleetMaintenance(agent.getPlayerEconomy()),
    );
  }
}
console.timeEnd('ook');

throw new Error('bye!');
////

for (let i = 0; i < agents; i++) {
  const player = new Player(date, strategy);
  players.push(player);
}

for (let x = 1; x < 24 * 360; x++) {
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
      players.map(p => p.getFleetValue()).reduce((a, b) => a + b, 0) / agents;
    const avgFleetMaintenance =
      players
        .map(p => p.getFleetMaintenance(p.getPlayerEconomy()))
        .reduce((a, b) => a + b, 0) / agents;

    console.log(
      `Days: ${x /
        24} Eco: ${avgEconomy} Bases: ${avgBases} Fleet: ${avgFleet} Maintenance: ${avgFleetMaintenance}`,
    );
  }
}
