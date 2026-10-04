// js/modules/Data.js
// data for dynamic creation 
export const buildingData = [ 
  { name: 'Worker', baseCost: 20, costMultiplier: 1.15, dps: 0.5 }, 
  { name: 'Restaurant', baseCost: 50, costMultiplier: 1.15, dps: 1 }, 
  { name: 'Robot Factory', baseCost: 150, costMultiplier: 1.15, dps: 2.5 }, 
  { name: 'Turkish Pizza', baseCost: 250, costMultiplier: 1.15, dps: 3 }, 
  { name: 'Doner Stand', baseCost: 500, costMultiplier: 1.15, dps: 5 }, 
  { name: 'Doner Factory', baseCost: 1000, costMultiplier: 1.15, dps: 7.5 }, 
  { name: 'Doner Empire', baseCost: 5000, costMultiplier: 1.15, dps: 10.5 }, 
  { name: 'Doner Planet', baseCost: 10000, costMultiplier: 1.15, dps: 13.5 }, 
  { name: 'Doner Galaxy', baseCost: 50000, costMultiplier: 1.15, dps: 19.5 }, 
  { name: 'Doner Universe', baseCost: 100000, costMultiplier: 1.15, dps: 31.5 } 
];

// costume requirements for each building upgrade tier
// 1. Unique requirement overrides per building tier 
export const customRequirements = {
  'Worker':        [12, 25, 50, 100], // Tier 1 = 12, Tier 2 = 25, etc.
  'Restaurant':    [15, 30, 60, 120], // Tier based run for the first 5 tiers then goes back to normal 
  'Robot Factory': [20, 40, 80, 150]
};

// Register events into the game's eventManager
export const GAME_EVENTS = [
  {
    id: 'meat_rush',
    name: 'Spit Shortage Boom',
    description: 'Global production doubled (x2)!',
    duration: 30,
    globalMultiplier: 2,
    triggerCondition: (game) => game.donerCount >= 50
  },
  {
    id: 'garlic_frenzy',
    name: 'Extra Knoflooksaus',
    description: 'Click power multiplied (x5)!',
    duration: 20,
    clickPowerMultiplier: 5,
    triggerCondition: (game) => game.totalClicks >= 25
  },
  {
    id: 'worker_coffee',
    name: 'Espresso Shift',
    description: 'Worker production multiplied (x4)!',
    duration: 45,
    buildingMultipliers: {
      'Worker': 4
    },
    triggerCondition: (game) => (game.buildings['Worker'] || 0) > 0
  }
];