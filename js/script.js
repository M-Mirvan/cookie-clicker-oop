class Game { 
    constructor() { 
      this.döner = 0; 
      this.buildings = []; 
      this.upgrades = []; // upgrades array
      this.freepurchase = false; // free purchases (test mode) 
      this.buyMultiplier = 1; // Current multiplier  
        
      // UI Elements 
      this.dönerDisplay = document.getElementById('clickCount'); 
      this.incomeDisplay = document.getElementById('income'); 
      this.clickButton = document.getElementById('clickDöner'); 

      // Custom Popup Elements 
      this.popupModal = document.getElementById('popup-modal'); 
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
          this.döner++; 
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
        this.döner += this.calculateIncome(); 
        this.updateUI(); 
      }, 1000); 
    } 

    showPopup(message) { 
      if (this.popupModal && this.popupMessage) { 
        this.popupMessage.innerText = message; 
        this.popupModal.classList.add('show'); 
      } else { 
        // Fallback als HTML elementen ontbreken 
        alert(message); 
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
      return this.buildings.reduce((total, building) => total + building.getIncome(), 0); 
    } 

    updateAllBuildingsUI() { 
      this.buildings.forEach(building => building.updateUI()); 
      // update the upgrade UI when buildings are upgraded.
      this.upgrades.forEach(upgrade => upgrade.updateUI());
    } 

    updateUI() { 
      if (this.dönerDisplay) this.dönerDisplay.innerText = this.döner; 
      if (this.incomeDisplay) this.incomeDisplay.innerText = this.calculateIncome(); 
      // Update the UI of all existing upgrades.
      this.upgrades.forEach(upgrade => upgrade.updateUI());
    } 
} 

// Upgrades Class
class Upgrades { 
    constructor(game, { name, cost, buildingName, multiplier }) { 
      this.game = game; 
      this.name = name;
      this.cost = cost; 
      this.buildingName = buildingName;
      this.multiplier = multiplier;
      this.purchased = false;

      //  nieuw HTML element voor deze upgrade
      this.element = document.createElement('div'); 
      this.element.className = 'upgrade-item'; 

      this.element.innerHTML = `
        <button class="buy-upgrade-btn">Buy ${this.name}</button>
        <p>Boosts ${this.buildingName} (x${this.multiplier})</p>
        <p>Cost: <span class="cost">${this.cost}</span> Döner</p>
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

      if (this.game.döner >= this.cost || this.game.freepurchase) {
        if (!this.game.freepurchase) {
          this.game.döner -= this.cost;
        }

        this.purchased = true;

        //  Apply the multiplier to the target building.
        const targetBuilding = this.game.buildings.find(b => b.name === this.buildingName);
        if (targetBuilding) {
          targetBuilding.dps *= this.multiplier;
        }

        // Remove the item from the list after purchase.
        this.element.remove(); 
        this.game.updateUI();
      } else {
        this.game.showPopup(`Je hebt ${this.cost} Döner nodig om ${this.name} te kopen.`);
      }
    }

    // Update the button status based on the balance.
    updateUI() {
      if (this.button) {
        this.button.disabled = this.game.döner < this.cost && !this.game.freepurchase;
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
        this.game.showPopup(`Je hebt ${totalCost} Döner nodig om ${amountToBuy}x ${this.name} te kopen.`); 
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
      if (this.countDisplay) this.countDisplay.innerText = this.count; 
      if (this.costDisplay) this.costDisplay.innerText = totalCost; 
      if (this.productionRateDisplay) this.productionRateDisplay.innerText = `${this.getIncome()} Döner/sec`; 
    } 
} 

// 3. Game and Buildings 
const game = new Game(); 

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

// Register Upgrades (dynamic)
const upgradeData = [
    { name: 'Sharper Knives', cost: 100, buildingName: 'Worker', multiplier: 2 },
    { name: 'Better Ovens', cost: 500, buildingName: 'Restaurant', multiplier: 2 },
    { name: 'AI Slicers', cost: 2000, buildingName: 'Robot Factory', multiplier: 2 }
];

// Add all upgrades to the game.
upgradeData.forEach(data => {
    game.addUpgrade(new Upgrades(game, data));
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