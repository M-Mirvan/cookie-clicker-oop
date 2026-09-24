// 1. Game State Class
class Game {
  constructor() {
    this.döner = 0;
    this.buildings = [];
    this.freepurchase = false; // free purchases (test mode)
    this.buyMultiplier = 1; // Current selected multiplier 
    
    // UI Elements
    this.dönerDisplay = document.getElementById('clickCount');
    this.incomeDisplay = document.getElementById('income');
    this.clickButton = document.getElementById('clickDöner');

    this.init();
  }

  init() {
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

  addBuilding(building) {
    this.buildings.push(building);
  }

  calculateIncome() {
    return this.buildings.reduce((total, building) => total + building.getIncome(), 0);
  }

  updateAllBuildingsUI() {
    this.buildings.forEach(building => building.updateUI());
  }

  updateUI() {
    if (this.dönerDisplay) this.dönerDisplay.innerText = this.döner;
    if (this.incomeDisplay) this.incomeDisplay.innerText = this.calculateIncome();
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
    alert(`Not enough Döner! You need ${totalCost} Döner to buy ${amountToBuy}x ${this.name}.`);
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

// 3. Game and Register Buildings
const game = new Game();

// data for dynamic creation
const buildingData = [
  { name: 'Worker', baseCost: 10, costMultiplier: 1.15, dps: 1 },
  { name: 'Restaurant', baseCost: 40, costMultiplier: 1.15, dps: 3 },
  { name: 'Robot Factory', baseCost: 120, costMultiplier: 1.15, dps: 10 },
  { name: 'Turkish Pizza', baseCost: 250, costMultiplier: 1.15, dps: 22 },
  { name: 'Doner Stand', baseCost: 500, costMultiplier: 1.15, dps: 48 },
  { name: 'Doner Factory', baseCost: 1000, costMultiplier: 1.15, dps: 100 },
  { name: 'Doner Empire', baseCost: 5000, costMultiplier: 1.15, dps: 600 },
  { name: 'Doner Planet', baseCost: 10000, costMultiplier: 1.15, dps: 1500 },
  { name: 'Doner Galaxy', baseCost: 50000, costMultiplier: 1.15, dps: 10000 },
  { name: 'Doner Universe', baseCost: 100000, costMultiplier: 1.15, dps: 50000 }
];

buildingData.forEach(data => {  
  game.addBuilding(new Building(game, data));
});

// multiplier button default active state
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