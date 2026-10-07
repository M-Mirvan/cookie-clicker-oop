import { Game } from './Game.js';
import { Building } from './modules/core/Building.js';
import { Upgrades, ClickUpgrade } from './modules/progression/Upgrades.js';
import { Gamble } from './modules/core/Gamble.js';
import {
  buildingData,
  customRequirements,
  GAME_EVENTS,
  CLICK_UPGRADES,
  TIER_UPGRADE_CONFIG
} from './modules/progression/Data.js';

const game = new Game();
const gamble = new Gamble(game);

// Hook up the visual effects
game.visuals.initFloatingText();

// Load all the random events into the event pool
GAME_EVENTS.forEach(eventData => {
  if (game.eventManager) {
    game.eventManager.registerEvent(eventData);
  }
});

// Load the main buildings defined in Data.js
buildingData.forEach(data => {
  game.addBuilding(new Building(game, data));
});

// Add the unique click upgrades
CLICK_UPGRADES.forEach(upgradeData => {
  game.addUpgrade(new ClickUpgrade(game, upgradeData));
});

// Generate all tier upgrades dynamically for every building
const upgradeLevels = [];

for (let i = 1; i <= TIER_UPGRADE_CONFIG.maxTiers; i++) {
  upgradeLevels.push({
    tier: i,
    req: i * TIER_UPGRADE_CONFIG.reqMultiplier,
    costMult: Math.round(Math.pow(TIER_UPGRADE_CONFIG.baseCostMultiplier, i) * 10),
    multiplier: 2,
    title: `Tier ${i}`
  });
}

buildingData.forEach(building => {
  upgradeLevels.forEach(level => {
    let requiredAmount = level.req;

    // Check if we have a custom override count for this tier
    const buildingReqs = customRequirements[building.name];

    if (buildingReqs && buildingReqs[level.tier - 1] !== undefined) {
      requiredAmount = buildingReqs[level.tier - 1];
    }

    game.addUpgrade(new Upgrades(game, {
      name: `${level.title} ${building.name}`,
      cost: building.baseCost * level.costMult,
      buildingName: building.name,
      multiplier: level.multiplier,
      requirementCount: requiredAmount,
      tier: level.tier
    }));
  });
});

// Set default active styling on the x1 buy multiplier button
const defaultMultiplierBtn = document.querySelector('.quantity-selectors button');

if (defaultMultiplierBtn) {
  defaultMultiplierBtn.classList.add('active');
}

// Theme toggle button logic
const themeBtn = document.getElementById('theme-toggle');

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    const isDark = document.body.classList.contains('dark-mode');

    themeBtn.innerText = isDark ? 'Light Mode' : 'Dark Mode';
  });
}

// Expose game instance to console for quick testing & debugging
window.game = game;

console.log('Main.js loaded successfully.');