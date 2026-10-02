class GameEvent {
  constructor({ id, name, description, duration, globalMultiplier = 1, buildingMultipliers = {}, clickPowerMultiplier = 1, triggerCondition = null, onStart = null, onEnd = null }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.duration = duration;
    this.timeRemaining = duration;
    
    this.globalMultiplier = globalMultiplier;
    this.buildingMultipliers = buildingMultipliers;
    this.clickPowerMultiplier = clickPowerMultiplier;
    this.triggerCondition = triggerCondition;
    
    this.onStart = onStart;
    this.onEnd = onEnd;
  }
}

class EventManager {
  constructor(game, options = {}) {
    this.game = game;
    this.eventPool = [];
    this.activeEvents = [];
    
    this.checkInterval = options.checkInterval || 10;
    this.chancePerCheck = options.chancePerCheck || 0.3;
    this.timer = 0;

    this.container = document.getElementById('events-banner') || this.createBannerContainer();
  }

  createBannerContainer() {
    const banner = document.createElement('div');
    banner.id = 'events-banner';
    banner.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 1000; display: flex; flex-direction: column; gap: 8px;';
    document.body.appendChild(banner);
    return banner;
  }

  registerEvent(eventData) {
    this.eventPool.push(eventData);
  }

  tick() {
    for (let i = this.activeEvents.length - 1; i >= 0; i--) {
      const event = this.activeEvents[i];
      event.timeRemaining--;

      this.updateEventUI(event);

      if (event.timeRemaining <= 0) {
        this.endEvent(event, i);
      }
    }

    this.timer++;
    if (this.timer >= this.checkInterval) {
      this.timer = 0;
      if (Math.random() < this.chancePerCheck) {
        this.triggerRandomEvent();
      }
    }
  }

  triggerRandomEvent() {
    if (this.eventPool.length === 0) return;

    const available = this.eventPool.filter(eData => {
      const isActive = this.activeEvents.some(active => active.id === eData.id);
      const conditionMet = typeof eData.triggerCondition === 'function' ? eData.triggerCondition(this.game) : true;
      return !isActive && conditionMet;
    });

    if (available.length === 0) return;

    const template = available[Math.floor(Math.random() * available.length)];
    const eventInstance = new GameEvent(template);

    this.activeEvents.push(eventInstance);

    if (typeof eventInstance.onStart === 'function') {
      eventInstance.onStart(this.game);
    }

    this.renderEventUI(eventInstance);
    this.game.showPopup(eventInstance.description, ` EVENT STARTED: ${eventInstance.name}!`);
  }

  endEvent(event, index) {
    this.activeEvents.splice(index, 1);

    if (typeof event.onEnd === 'function') {
      event.onEnd(this.game);
    }

    const element = document.getElementById(`event-card-${event.id}`);
    if (element) element.remove();

    this.game.updateUI();
  }

  getGlobalMultiplier() {
    return this.activeEvents.reduce((mult, e) => mult * e.globalMultiplier, 1);
  }

  getBuildingMultiplier(buildingName) {
    return this.activeEvents.reduce((mult, e) => {
      const bMult = e.buildingMultipliers[buildingName] || 1;
      return mult * bMult;
    }, 1);
  }

  getClickPowerMultiplier() {
    return this.activeEvents.reduce((mult, e) => mult * e.clickPowerMultiplier, 1);
  }

  renderEventUI(event) {
    const card = document.createElement('div');
    card.id = `event-card-${event.id}`;
    card.className = 'event-card';
    card.style.cssText = 'background: #222; color: #fff; border: 2px solid #f39c12; padding: 10px; borderRadius: 6px; minWidth: 200px; boxShadow: 0 4px 6px rgba(0,0,0,0.3);';
    card.innerHTML = `
      <strong style="color: #f39c12;">${event.name}</strong>
      <p style="margin: 4px 0; fontSize: 12px;">${event.description}</p>
      <small style="color: #aaa;">Time left: <span class="time-left">${event.timeRemaining}</span>s</small>
    `;
    this.container.appendChild(card);
  }

  updateEventUI(event) {
    const card = document.getElementById(`event-card-${event.id}`);
    if (card) {
      const timeSpan = card.querySelector('.time-left');
      if (timeSpan) timeSpan.innerText = event.timeRemaining;
    }
  }
}

class Game { 
    constructor() { 
      this.döner = 0; 
      this.clickPower = 1; 
      this.buildings = []; 
      this.upgrades = []; // upgrades array
      this.freepurchase = false; // free purchases (test mode) 
      this.buyMultiplier = 1; // Current multiplier  
        
      this.eventManager = new EventManager(this, {
        checkInterval: 15,
        chancePerCheck: 0.4
      });

      // UI Elements 
      this.dönerDisplay = document.getElementById('clickCount'); 
      this.incomeDisplay = document.getElementById('income'); 
      this.clickPowerDisplay = document.getElementById('clickPower'); 
      this.clickButton = document.getElementById('clickDöner'); 

      this.globalMultiplierDisplay = document.getElementById('globalMultiplier');
      this.clickMultiplierDisplay = document.getElementById('clickMultiplier');

      // Custom Popup Elements 
      this.popupModal = document.getElementById('popup-modal'); 
      this.popupTitle = document.getElementById('popup-title');
      this.popupMessage = document.getElementById('popup-message'); 
      this.popupCloseBtn = document.getElementById('popup-close-btn'); 

      this.init(); 
    } 

    init() { 
      // Popup sluiten via knop 
      if (this.popupCloseBtn) { 
        this.popupCloseBtn.addEventListener('click', () => this.hidePopup()); 
      } 

      // Popup sluiten door buiten het venster te klikken 
      if (this.popupModal) { 
        this.popupModal.addEventListener('click', (e) => { 
          if (e.target === this.popupModal) this.hidePopup(); 
        }); 
      } 

      // Manual click listener 
      if (this.clickButton) { 
        this.clickButton.addEventListener('click', () => { 
          const totalClickPower = this.clickPower * this.eventManager.getClickPowerMultiplier();
          this.döner += totalClickPower; 
          this.updateUI(); 
        }); 
      } 

      // Multiplier Button Listeners 
      const multiplierButtons = document.querySelectorAll('.quantity-selectors button'); 
      multiplierButtons.forEach(btn => { 
        btn.addEventListener('click', (e) => { 
          multiplierButtons.forEach(b => b.classList.remove('active')); 
          e.target.classList.add('active'); 

          this.buyMultiplier = parseInt(e.target.innerText) || 1; 
          this.updateAllBuildingsUI(); 
        }); 
      }); 

      // Game loop  
      setInterval(() => { 
        this.eventManager.tick();
        this.döner += this.calculateIncome(); 
        this.updateUI(); 
      }, 1000); 
    } 

    showPopup(message, title = 'Niet genoeg Döner!') { 
      if (this.popupModal && this.popupMessage) { 
        if (this.popupTitle) this.popupTitle.innerText = title;
        this.popupMessage.innerText = message; 
        this.popupModal.classList.add('show'); 
      } else { 
        // Fallback als HTML elementen ontbreken 
        alert(`${title}\n${message}`); 
      } 
    } 

    hidePopup() { 
      if (this.popupModal) { 
        this.popupModal.classList.remove('show'); 
      } 
    } 

    addBuilding(building) { 
      this.buildings.push(building); 
    } 

    // Methode om een nieuwe upgrade toe te voegen 
    addUpgrade(upgrade) {
      this.upgrades.push(upgrade);
    }

    calculateIncome() { 
      const globalEventMult = this.eventManager.getGlobalMultiplier();

      return this.buildings.reduce((total, building) => {
        const buildingEventMult = this.eventManager.getBuildingMultiplier(building.name);
        return total + (building.getIncome() * buildingEventMult);
      }, 0) * globalEventMult; 
    } 

    updateAllBuildingsUI() { 
      this.buildings.forEach(building => building.updateUI()); 
      // update the upgrade UI when buildings are upgraded.
      this.upgrades.forEach(upgrade => upgrade.updateUI());
    } 

    updateUI() { 
      if (this.dönerDisplay) this.dönerDisplay.innerText = Formatter.format(this.döner); 
      
      const globalMult = this.eventManager.getGlobalMultiplier();
      const totalIncome = this.calculateIncome();
      
      if (this.incomeDisplay) {
        if (globalMult > 1) {
          this.incomeDisplay.innerText = `${Formatter.format(totalIncome)} (x${globalMult.toFixed(1)})`;
        } else {
          this.incomeDisplay.innerText = Formatter.format(totalIncome);
        }
      }

      const clickMult = this.eventManager.getClickPowerMultiplier();
      const totalClickPower = this.clickPower * clickMult;

      if (this.clickPowerDisplay) {
        if (clickMult > 1) {
          this.clickPowerDisplay.innerText = `${Formatter.format(totalClickPower)} (x${clickMult.toFixed(1)})`;
        } else {
          this.clickPowerDisplay.innerText = Formatter.format(this.clickPower);
        }
      }

      if (this.globalMultiplierDisplay) {
        this.globalMultiplierDisplay.innerText = `x${globalMult.toFixed(1)}`;
      }
      if (this.clickMultiplierDisplay) {
        this.clickMultiplierDisplay.innerText = `x${clickMult.toFixed(1)}`;
      }

      // Update the UI of all existing upgrades.
      this.upgrades.forEach(upgrade => upgrade.updateUI());
    } 
} 

class Formatter {
  static suffixes = [
    '', 
    ' Thousand', ' Million', ' Billion', ' Trillion', ' Quadrillion', ' Quintillion', 
    ' Sextillion', ' Septillion', ' Octillion', ' Nonillion', ' Decillion',' Undecillion', 
    ' Duodecillion', ' Tredecillion', ' Quattuordecillion', ' Quindecillion', ' Sexdecillion', 
    ' Septendecillion', ' Octodecillion', ' Novemdecillion', ' Vigintillion'
  ];

  static format(value) {
    if (value === undefined || value === null || isNaN(value)) return '0';

    // Getallen onder 1000
    if (value < 1000) {
      return Number.isInteger(value) 
        ? value.toString() 
        : value.toFixed(1); // toont 1 decimaal voor getallen onder 1000
    }

    const tier = Math.floor(Math.log10(value) / 3);

    if (tier >= this.suffixes.length) {
      return value.toExponential(2).replace('+', '');
    }

    const suffix = this.suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = value / scale;

    // Behoud altijd x decimalen nu 0
    return scaled.toFixed(0) + suffix;
  }
}

// Upgrades Class
class Upgrades { 
    constructor(game, { name, cost, buildingName, multiplier = 2, requirementCount = 0, tier = 1 }) { 
      this.game = game; 
      this.name = name;
      this.cost = cost; 
      this.buildingName = buildingName;
      this.multiplier = multiplier;
      this.requirementCount = requirementCount;
      this.tier = tier;
      this.purchased = false;

      this.element = document.createElement('div'); 
      this.element.className = 'upgrade-item';
      this.element.style.display = 'none'; // Hide the flicker when refreshing the UI/the game 

      this.element.innerHTML = `
        <button class="buy-upgrade-btn">Buy ${this.name}</button>
        <p>Boosts ${this.buildingName} (x${this.multiplier})</p>
        <p>Cost: <span class="cost">${this.cost}</span> Döner</p>
        <p class="req-text">Requires: ${this.requirementCount}x ${this.buildingName}</p>
      `;

      this.button = this.element.querySelector('.buy-upgrade-btn');
      this.costDisplay = this.element.querySelector('.cost');

      // new upgrade element each time a building is available
      const container = document.getElementById('upgrades-list'); 
      if (container) { 
        container.appendChild(this.element); 
      } 

      this.init();
      this.updateUI();
    } 

    // event listener (koopknop)
    init() {
      if (this.button) {
        this.button.addEventListener('click', () => this.buy());
      }
    }

    // buy upgrades logic
    buy() {
      if (this.purchased) return;

      const targetBuilding = this.game.buildings.find(b => b.name === this.buildingName);
      const buildingCount = targetBuilding ? targetBuilding.count : 0;

      if ((this.game.döner >= this.cost && buildingCount >= this.requirementCount) || this.game.freepurchase) {
        if (!this.game.freepurchase) {
          this.game.döner -= this.cost;
        }

        this.purchased = true;

        //  Apply the multiplier to the target building.
        if (targetBuilding) {
          targetBuilding.dps *= this.multiplier;
        }

        // Remove the item from the list after purchase.
        this.element.remove(); 
        this.game.updateUI();
      } else {
        if (buildingCount < this.requirementCount) {
          this.game.showPopup(`Je hebt minstens ${this.requirementCount}x ${this.buildingName} nodig om deze upgrade te kopen.`);
        } else {
          this.game.showPopup(`Je hebt ${Formatter.format(this.cost)} Döner nodig om ${this.name} te kopen.`);
        }
      }
    }

    // Update the button status based on the balance.
    updateUI() {
      if (this.purchased) return;

      const targetBuilding = this.game.buildings.find(b => b.name === this.buildingName); 
      const buildingCount = targetBuilding ? targetBuilding.count : 0;

      const previousUpgrade = this.game.upgrades.find(u => 
        u.buildingName === this.buildingName && u.tier === this.tier - 1
      );

      const isPreviousPurchased = !previousUpgrade || previousUpgrade.purchased;

      if (isPreviousPurchased && (buildingCount >= this.requirementCount || this.game.freepurchase)) {
        this.element.style.display = 'block';
      } else {
        this.element.style.display = 'none';
      }

      if (this.costDisplay) this.costDisplay.innerText = Formatter.format(this.cost);

      if (this.button) {
        this.button.disabled = this.game.döner < this.cost && !this.game.freepurchase;
      }
    }
} 

class ClickUpgrade extends Upgrades {
    constructor(game, { name, baseCost, costMultiplier = 2, clickPowerBonus, requiredBuilding = null, baseRequiredCount = 0, countPerLevel = 5, maxLevel = Infinity }) {
      super(game, { name, cost: baseCost, buildingName: requiredBuilding, requirementCount: baseRequiredCount });
      
      this.baseCost = baseCost;
      this.costMultiplier = costMultiplier;
      this.clickPowerBonus = clickPowerBonus;
      this.requiredBuilding = requiredBuilding;
      this.baseRequiredCount = baseRequiredCount;
      this.countPerLevel = countPerLevel;
      this.maxLevel = maxLevel;

      this.level = 0;
      this.cost = baseCost;
      this.requiredCount = baseRequiredCount;

      this.element.innerHTML = `
        <button class="buy-upgrade-btn">Buy ${this.name} (Lvl <span class="lvl">1</span>)</button>
        <p>Boosts Click Power (+${this.clickPowerBonus} per click)</p>
        <p>Cost: <span class="cost">${this.cost}</span> Döner</p>
        <p class="req-text"></p>
      `;

      this.button = this.element.querySelector('.buy-upgrade-btn');
      this.costDisplay = this.element.querySelector('.cost');
      this.lvlDisplay = this.element.querySelector('.lvl');
      this.reqTextDisplay = this.element.querySelector('.req-text');

      this.element.style.display = 'none'; // Hide the flicker when refreshing the UI/the game
      this.init();
      this.updateUI(); // 👈 Typfout hersteld (haakjes toegevoegd)
    }

    buy() {
      if (this.level >= this.maxLevel) return;

      const targetBuilding = this.game.buildings.find(b => b.name === this.requiredBuilding);
      const buildingCount = targetBuilding ? targetBuilding.count : 0;

      // Controleer gebouweis
      if (this.requiredBuilding && buildingCount < this.requiredCount && !this.game.freepurchase) {
        this.game.showPopup(`Je hebt minstens ${this.requiredCount}x ${this.requiredBuilding} nodig om deze upgrade te kopen.`);
        return;
      }

      // Controleer geld
      if (this.game.döner >= this.cost || this.game.freepurchase) {
        if (!this.game.freepurchase) {
          this.game.döner -= this.cost;
        }

        this.level++;
        this.game.clickPower += this.clickPowerBonus;

        // Bereken nieuwe kosten en nieuwe gebouweis voor het volgende niveau
        this.cost = Math.ceil(this.baseCost * Math.pow(this.costMultiplier, this.level));
        this.requiredCount = this.baseRequiredCount + (this.level * this.countPerLevel);

        // Als het maximale niveau is bereikt, verwijder het element
        if (this.level >= this.maxLevel) {
          this.purchased = true;
          this.element.remove();
        }

        this.game.updateUI();
      } else {
        this.game.showPopup(`Je hebt ${Formatter.format(this.cost)} Döner nodig om ${this.name} te kopen.`);
      }
    }

    updateUI() {
      if (this.purchased) return;

      const targetBuilding = this.game.buildings.find(b => b.name === this.requiredBuilding);
      const buildingCount = targetBuilding ? targetBuilding.count : 0;

      const hasEnoughBuildings = !this.requiredBuilding || buildingCount >= this.requiredCount;

      // Update teksten op de knop en kaart
      if (this.lvlDisplay) this.lvlDisplay.innerText = this.level + 1;
      if (this.costDisplay) this.costDisplay.innerText = Formatter.format(this.cost);
      
      if (this.reqTextDisplay) {
        this.reqTextDisplay.innerText = this.requiredBuilding 
          ? `Requires: ${Formatter.format(this.requiredCount)}x ${this.requiredBuilding}` 
          : '';
      }

      // Toon de upgrade zodra de speler de eerste eis heeft behaald
      if (hasEnoughBuildings || this.level > 0 || this.game.freepurchase) {
        this.element.style.display = 'block';
      } else {
        this.element.style.display = 'none';
      }

      if (this.button) {
        this.button.disabled = (this.game.döner < this.cost || !hasEnoughBuildings) && !this.game.freepurchase;
      }
    }
}

// 2. Building Class 
class Building { 
    constructor(game, { name, baseCost, costMultiplier, dps }) { 
      this.game = game; 
      this.name = name; 
      this.cost = baseCost;  
      this.costmultiplier = costMultiplier; 
      this.dps = dps; 
      this.count = 0; 

      // new building element each time a building is created 
      this.element = document.createElement('div'); 
      this.element.className = 'building-item'; 

      this.element.innerHTML = ` 
          <button class="buy-btn">${this.name}</button> 
          <p>Count: <span class="count">0</span></p> 
          <p>Cost: <span class="cost">${this.cost}</span> Döner</p> 
          <p>Production Rate: <span class="production-rate">0 Döner/sec</span></p> 
      `; 
        
      this.button = this.element.querySelector('.buy-btn'); 
      this.countDisplay = this.element.querySelector('.count'); 
      this.costDisplay = this.element.querySelector('.cost'); 
      this.productionRateDisplay = this.element.querySelector('.production-rate'); 

      // add new building to the buildings list container 
      const container = document.getElementById('buildings-list'); 
      if (container) { 
        container.appendChild(this.element); 
      } 

      this.init(); 

      this.updateUI(); 
    } 

    init() { 
      if (this.button) { 
        this.button.addEventListener('click', () => this.buy()); 
      } 
    } 

    getTotalCost(amountToBuy) { 
      let totalCost = 0; 
      let nextItemCost = this.cost; 

      for (let itemStep = 0; itemStep < amountToBuy; itemStep++) { 
        totalCost += nextItemCost; 
        nextItemCost = Math.ceil(nextItemCost * this.costmultiplier); 
      } 

      return totalCost; 
    } 

    buy() { 
      const amountToBuy = this.game.buyMultiplier; 
      const totalCost = this.getTotalCost(amountToBuy); 

      if (this.game.döner >= totalCost || this.game.freepurchase) { 
        if (!this.game.freepurchase) { 
          this.game.döner -= totalCost; 
        } 

        for (let purchaseStep = 0; purchaseStep < amountToBuy; purchaseStep++) { 
          this.count++; 
          this.cost = Math.ceil(this.cost * this.costmultiplier); 
        } 

        this.updateUI(); 
        this.game.updateUI(); 
      } else { 
        //  custom popup functie  
        this.game.showPopup(`Je hebt ${Formatter.format(totalCost)} Döner nodig om ${amountToBuy}x ${this.name} te kopen.`); 
      } 
    } 

    getIncome() { 
      return this.count * this.dps; 
    } 

    updateUI() { 
      const amountToBuy = this.game.buyMultiplier; 
      const totalCost = this.getTotalCost(amountToBuy); 

      if (this.button) { 
        this.button.innerText = `Buy x${amountToBuy} ${this.name}`; 
      } 
      if (this.countDisplay) this.countDisplay.innerText = Formatter.format(this.count); 
      if (this.costDisplay) this.costDisplay.innerText = Formatter.format(totalCost); 
      if (this.productionRateDisplay) this.productionRateDisplay.innerText = `${Formatter.format(this.getIncome())} Döner/sec`; 
    } 
} 

// 3. Game and Buildings 
const game = new Game(); 

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

// data for dynamic creation 
const buildingData = [ 
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
const maxTiers = 50; //  upgrades up to level 1250 for each building.

for (let i = 1; i <= maxTiers; i++) {
    upgradeLevels.push({
        tier: i,
        req: i * 25, // req: Increases linearly by 25 per tier (25, 50, 75...)
        costMult: Math.round(Math.pow(2.5, i) * 10), // costMult: Scales exponentially (x2.5 per tier)
        multiplier: 2, // multiplier: Doubles CPS (x2)
        title: `Tier ${i}`
    });
}

// 1. Unique requirement overrides per building tier
const customRequirements = {
    'Worker':          [12, 25, 50, 100], // Tier 1 = 12, Tier 2 = 25, etc.
    'Restaurant':      [15, 30, 60, 120], // Tier based run for the first 5 tiers then goes back to normal
    'Robot Factory':   [20, 40, 80, 150]
};

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