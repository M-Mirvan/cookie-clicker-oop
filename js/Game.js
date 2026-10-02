import { Formatter } from './modules/Formatter.js';
import { EventManager } from './modules/EventManager.js';

// 1. Game Class
export class Game { 
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

      // Update building buttons disabled state as money changes
      this.buildings.forEach(building => building.updateUI());

      // Update the UI of all existing upgrades.
      this.upgrades.forEach(upgrade => upgrade.updateUI());
    } 
}
console.log('game.js.');