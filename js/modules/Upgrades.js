import { Formatter } from './Formatter.js';

// Upgrades Class
export class Upgrades { 
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

      // Prevent purchase if criteria are not met
      if ((this.game.döner < this.cost || buildingCount < this.requirementCount) && !this.game.freepurchase) {
        return;
      }

      if (!this.game.freepurchase) {
        this.game.döner -= this.cost;
      }

      this.purchased = true;

      // Apply the multiplier to the target building.
      if (targetBuilding) {
        targetBuilding.dps *= this.multiplier;
      }

      // Remove the item from the list after purchase.
      this.element.remove(); 
      this.game.updateUI();
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
        this.button.disabled = (this.game.döner < this.cost || buildingCount < this.requirementCount) && !this.game.freepurchase;
      }
    }
} 

export class ClickUpgrade extends Upgrades {
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
      this.updateUI();
    }

    buy() {
      if (this.level >= this.maxLevel) return;

      const targetBuilding = this.game.buildings.find(b => b.name === this.requiredBuilding);
      const buildingCount = targetBuilding ? targetBuilding.count : 0;

      const hasEnoughBuildings = !this.requiredBuilding || buildingCount >= this.requiredCount;

      if ((this.game.döner < this.cost || !hasEnoughBuildings) && !this.game.freepurchase) {
        return;
      }

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
console.log('Upgrades.js.');