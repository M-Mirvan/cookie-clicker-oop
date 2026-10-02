import { Formatter } from './Formatter.js';

// 2. Building Class 
export class Building { 
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
      // Prevent purchase if player can't afford it instead of popup
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
        this.button.disabled = this.game.döner < totalCost && !this.game.freepurchase; // Disable button when the player doesn't have enough money to buy instead of popup
      } 
      if (this.countDisplay) this.countDisplay.innerText = Formatter.format(this.count); 
      if (this.costDisplay) this.costDisplay.innerText = Formatter.format(totalCost); 
      if (this.productionRateDisplay) this.productionRateDisplay.innerText = `${Formatter.format(this.getIncome())} Döner/sec`; 
    } 
}