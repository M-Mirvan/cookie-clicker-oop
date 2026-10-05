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
  'Robot Factory': [20, 40, 80, 150] // you can add more buildings and their custom requirements here
  // to get and upgrade for the building kind of a boost like x2 production rate
};

// Register events into the game's eventManager
export const GAME_EVENTS = [
  {
    id: 'meat_rush',
    name: 'Spit Shortage Boom',
    description: 'Global production doubled (x2)!',
    duration: 30,
    globalMultiplier: 2,
    // Fixed: check game.döner (or game.doner)
    triggerCondition: (game) => (game.döner ?? game.doner ?? 0) >= 50 // requires at least 50 Döner to trigger
  },
  {
    id: 'garlic_frenzy',
    name: 'Extra Knoflooksaus',
    description: 'Click power multiplied (x5)!',
    duration: 20,
    clickPowerMultiplier: 5,
    triggerCondition: (game) => (game.döner ?? game.doner ?? 0) >= 100 // requires at least 100 Döner to trigger
  },
  {
    id: 'worker_coffee',
    name: 'Espresso Shift',
    description: 'Worker production multiplied (x4)!',
    duration: 45,
    buildingMultipliers: {
      'Worker': 4
    },
    triggerCondition: (game) => {
      const worker = game.buildings?.find(b => b.name === 'Worker'); // requires at least 1 Worker to trigger
      return (worker?.count || 0) > 0;
    }
  }
];

// Unique Click Upgrades 
export const CLICK_UPGRADES = [
  {
    name: 'Scherper Mes',
    baseCost: 50,
    costMultiplier: 1.15,
    clickPowerBonus: 1
  },
  {
    name: 'Worker Snijtechniek',
    baseCost: 200,
    costMultiplier: 2.5,
    clickPowerBonus: 3,
    requiredBuilding: 'Worker',
    baseRequiredCount: 5,
    countPerLevel: 5
  },
  {
    name: 'Keuken Efficientie',
    baseCost: 1000,
    costMultiplier: 3,
    clickPowerBonus: 10,
    requiredBuilding: 'Restaurant',
    baseRequiredCount: 10,
    countPerLevel: 10
  }
];

export const TIER_UPGRADE_CONFIG = {
  maxTiers: 50,
  reqMultiplier: 25,
  baseCostMultiplier: 1.8
};

//SKins 
export const SKIN_STAGES = [
  {
    id: 'wrap',
    name: 'Döner Wrap',
    image: '/IMG/screenshot 2026-09-22 130947-Photoroom.png',
    requirement: (game) => true,
    clickMultiplier: 1.0,
    cpsMultiplier: 1.0
  },
  {
    id: 'broodje',
    name: 'Broodje Döner',
    image: '/IMG/broodjedoner.png',
    requirement: (game) => (game.döner ?? game.doner ?? 0) >= 50000,
    clickMultiplier: 1.5,
    clickPowerBonus: 0.25,
    cpsMultiplier: 1.5
  },
  {
    id: 'durum',
    name: 'Dürüm Döner',
    image: '/IMG/durumdoner.png',
    requirement: (game) => {
      const worker = game.buildings?.find(b => b.name === 'Worker');
      return (worker?.count || 0) >= 35 && (game.döner ?? game.doner ?? 0) >= 250000;
    },
    clickMultiplier: 2.0,
    cpsMultiplier: 1.0,
    unlocksComboMeter: true
  },
  {
    id: 'doner_rol',
    name: 'Döner Rol',
    image: '/IMG/donerspit.webp',
    requirement: (game) => {
      const totalBuildings = game.buildings?.reduce((sum, b) => sum + (b.count || 0), 0) || 0;
      return totalBuildings >= 100 && game.easterEggUnlocked;
      // cheats
      // 1. Set a building count to 100
      window.game.buildings[0].count = 100;

      // 2. Set the easter egg flag to true
      window.game.easterEggUnlocked = true;

      // 3. Trigger the check manually to update instantly
      window.game.visuals.checkSkinProgression();

    },
    clickMultiplier: 3.0,
    cpsMultiplier: 1.0,
    isAnimatedSpit: true
  },
  {
    id: 'golden_kapsalon',
    name: 'Golden Kapsalon',
    image: 'assets/skins/kapsalon.png',
    requirement: (game) => {
      const factory = game.buildings?.find(b => b.name === 'Doner Factory');
      const currentDoner = game.döner ?? game.doner ?? 0;
      return (currentDoner >= 1000000000 && (factory?.count || 0) >= 1) || (game.totalClicks || 0) >= 100000;
    },
    clickMultiplier: 10.0,
    cpsMultiplier: 10.0,
    hasGoldFoilParticles: true
  }
];

console.log("Data.js loaded successfully.");