import { Game } from './Game.js';
import { Building } from './modules/Building.js';
import { Upgrades, ClickUpgrade } from './modules/Upgrades.js';
import { buildingData, customRequirements } from './modules/Data.js';

// 3. Game and Buildings 
const game = new Game(); 

// Register events into the game's eventManager
game.eventManager.registerEvent({
  id: 'meat_rush',
  name: 'Spit Shortage Boom',
  description: 'Global production doubled x2!',
  duration: 30,
  globalMultiplier: 2
});

game.eventManager.registerEvent({
  id: 'garlic_frenzy',
  name: 'Extra Knoflooksaus',
  description: 'Click power multiplied x5!',
  duration: 20,
  clickPowerMultiplier: 5
});

game.eventManager.registerEvent({
  id: 'worker_coffee',
  name: 'Espresso Shift',
  description: 'Worker production multiplied x4!',
  duration: 45,
  buildingMultipliers: {
    'Worker': 4
  }
});

buildingData.forEach(data => {    
    game.addBuilding(new Building(game, data)); 
}); 

// Unique upgrades for each time you click the doner

// Scherper Mes
game.addUpgrade(new ClickUpgrade(game, {
    name: 'Scherper Mes',
    baseCost: 50,
    costMultiplier: 1.15, // Cost mult x1.15 each time you buy it 
    clickPowerBonus: 1 // Adds +1 to click doner each time you buy it 
}));

// Worker Snijtechniek
game.addUpgrade(new ClickUpgrade(game, {
    name: 'Worker Snijtechniek',
    baseCost: 200,
    costMultiplier: 2.5,
    clickPowerBonus: 3,
    requiredBuilding: 'Worker', // Type of requirement to buy the upgrade
    baseRequiredCount: 5, // How many (factories) you need to buy level 1 
    countPerLevel: 5 // Increases the requirement by 5 per level
}));

// Keuken Efficientie
game.addUpgrade(new ClickUpgrade(game, {
    name: 'Keuken Efficientie',
    baseCost: 1000,
    costMultiplier: 3,
    clickPowerBonus: 10,
    requiredBuilding: 'Restaurant',
    baseRequiredCount: 10,
    countPerLevel: 10
}));

const upgradeLevels = [];
const maxTiers = 50; // upgrades up to level 1250 for each building.

for (let i = 1; i <= maxTiers; i++) {
    upgradeLevels.push({
        tier: i,
        req: i * 25, // req: Increases linearly by 25 per tier (25, 50, 75...)
        costMult: Math.round(Math.pow(2.5, i) * 10), // costMult: Scales exponentially (x2.5 per tier)
        multiplier: 2, // multiplier: Doubles CPS (x2)
        title: `Tier ${i}`
    });
}

// 2. Generate upgrades with custom requirement overrides
buildingData.forEach(building => {
    upgradeLevels.forEach(level => {
        
        // Fallback to the standard requirement from level.req
        let requiredAmount = level.req;

        // Check if a custom requirement exists for this specific building and tier
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

// multiplier button  
const defaultMultiplierBtn = document.querySelector('.quantity-selectors button'); 
if (defaultMultiplierBtn) { 
    defaultMultiplierBtn.classList.add('active'); 
} 

// 4. Theme Toggle Logic 
const themeBtn = document.getElementById('theme-toggle'); 
if (themeBtn) { 
    themeBtn.addEventListener('click', () => { 
      document.body.classList.toggle('dark-mode'); 
      const isDark = document.body.classList.contains('dark-mode'); 
      themeBtn.innerText = isDark ? 'Light Mode' : 'Dark Mode'; 
    }); 
} else { 
    console.warn('Theme toggle button not found in the DOM.'); 
}  

// 5. Expose game instance for debugging + adding money cheat 
window.game = game;

console.log('main.');