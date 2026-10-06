import { Formatter } from './modules/core/Formatter.js';
import { EventManager } from './modules/core/EventManager.js';
import { StorageManager } from './modules/core/Storage.js';
import { Visuals } from './modules/progression/Visuals.js';

// 1. Game Class
export class Game {
  constructor() {
    this.döner = 0;
    this.clickPower = 1;
    this.buildings = [];
    this.upgrades = [];
    this.freepurchase = false; // free purchases (test mode)
    this.buyMultiplier = 1; // Current multiplier

    this.eventManager = new EventManager(this, {
      checkInterval: 15,
      chancePerCheck: 0.4
    });

    // Single instances of Managers
    this.storageManager = new StorageManager(this);
    this.visuals = new Visuals(this, 'clickDöner');

    // UI Elements
    this.dönerDisplay = document.getElementById('clickCount');
    this.incomeDisplay = document.getElementById('income');
    this.clickPowerDisplay = document.getElementById('clickPower');
    this.clickButton = document.getElementById('clickDöner');

    this.globalMultiplierDisplay = document.getElementById('globalMultiplier');
    this.clickMultiplierDisplay = document.getElementById('clickMultiplier');

    // Options Modal Elements
    this.optionsModal = document.getElementById('options-modal');
    this.optionsBtn = document.getElementById('options-btn');
    this.optionsCloseBtn = document.getElementById('options-close-btn');

    // Save/Load UI Elements
    this.saveButton = document.getElementById('save-btn');
    this.loadButton = document.getElementById('load-btn');
    this.resetButton = document.getElementById('reset-btn');

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
        if (e.target === this.popupModal) {
          this.hidePopup();
        }
      });
    }

    // Open options modal
    if (this.optionsBtn && this.optionsModal) {
      this.optionsBtn.addEventListener('click', () => {
        this.optionsModal.classList.add('show');
      });
    }

    // Close options modal
    if (this.optionsCloseBtn && this.optionsModal) {
      this.optionsCloseBtn.addEventListener('click', () => {
        this.optionsModal.classList.remove('show');
      });
    }

    // Close options modal when clicking outside content
    if (this.optionsModal) {
      this.optionsModal.addEventListener('click', (e) => {
        if (e.target === this.optionsModal) {
          this.optionsModal.classList.remove('show');
        }
      });
    }

    // Save, Load & Reset button listeners
    if (this.saveButton) {
      this.saveButton.addEventListener('click', () => {
        this.storageManager.save(true);
      });
    }

    if (this.loadButton) {
      this.loadButton.addEventListener('click', () => {
        this.storageManager.load(true);
      });
    }

    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => {
        this.storageManager.reset();
      });
    }

    // Manual click listener
    if (this.clickButton) {
      this.clickButton.addEventListener('click', () => {
        const totalClickPower = this.getTotalClickPower();
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

    // Load save file on startup
    setTimeout(() => {
      this.storageManager.load();
    }, 50);

    // Game loop
    setInterval(() => {
      this.eventManager.tick();
      this.visuals.checkSkinProgression(); // Checks skin each sec
      this.döner += this.calculateIncome();
      this.updateUI();
    }, 1000);

    // Auto-save every 10 seconds
    setInterval(() => {
      this.storageManager.save();
    }, 10000);

    // Auto-save when user leaves or reloads the tab
    window.addEventListener('beforeunload', () => {
      this.storageManager.save();
    });
  }

  // =========================================================
  // CLICK POWER
  // =========================================================

  getTotalClickPower() {
    const eventMultiplier = this.eventManager.getClickPowerMultiplier();
    return this.clickPower * eventMultiplier;
  }

  // =========================================================
  // POPUPS
  // =========================================================

  showPopup(message, title = 'Niet genoeg Döner!') {
    if (this.popupModal && this.popupMessage) {
      if (this.popupTitle) {
        this.popupTitle.innerText = title;
      }

      this.popupMessage.innerText = message;
      this.popupModal.classList.add('show');
    } else {
      alert(`${title}\n${message}`);
    }
  }

  hidePopup() {
    if (this.popupModal) {
      this.popupModal.classList.remove('show');
    }
  }

  // =========================================================
  // BUILDINGS / UPGRADES
  // =========================================================

  addBuilding(building) {
    this.buildings.push(building);
  }

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
    this.upgrades.forEach(upgrade => upgrade.updateUI());
  }

  // =========================================================
  // UI
  // =========================================================

  updateUI() {
    if (this.dönerDisplay) {
      this.dönerDisplay.innerText = Formatter.format(this.döner);
    }

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
    const totalClickPower = this.getTotalClickPower();

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

    this.buildings.forEach(building => building.updateUI());
    this.upgrades.forEach(upgrade => upgrade.updateUI());
  }
}

console.log('game.js loaded.');
