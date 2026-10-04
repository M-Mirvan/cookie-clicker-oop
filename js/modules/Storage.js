export class StorageManager {
  constructor(game, storageKey = 'donerGameSave') {
    this.game = game;
    this.storageKey = storageKey;
    this.isResetting = false; // Prevents auto-save from overwriting on reload
  }

// SAVE METHOD
  save(manual = false) {
    if (this.isResetting) return; // stop saving if a reset is currently happening 

    // Gather all relevant game data into a single object 
    const saveData = {
      döner: this.game.döner, // doner you have 
      clickPower: this.game.clickPower, // current click power
      buildings: this.game.buildings.map(building => ({ // Loop through all buildings and extract only the properties that needed
        name: building.name, 
        count: building.count, 
        cost: building.cost 
      })),
      upgrades: this.game.upgrades.map(upgrade => ({ // the same for upgrades, only saving the necessary properties
        name: upgrade.name,
        purchased: upgrade.purchased,
        level: upgrade.level ?? null, 
        cost: upgrade.cost,
        requiredCount: upgrade.requiredCount ?? null
      }))
    };

    // Save the data to localStorage as a JSON text string and store in localStorage 
    localStorage.setItem(this.storageKey, JSON.stringify(saveData));
    
    // Show a popup if the player manually saved the game
    if (manual) {
      this.game.showPopup('Je voortgang is succesvol opgeslagen!', 'Spel Opgeslagen');
    }
  }

  // LOAD METHOD
  load(manual = false) {
    const savedData = localStorage.getItem(this.storageKey); // Retrieve the saved data from localStorage

    // A handle for when there is no saved data found
    if (!savedData) {
      if (manual) {
        this.game.showPopup('Er is geen opgeslagen spel gevonden.', 'Geen Save');
      }
      return; // no data to load, exit the function
    }

    // Convert saved JSON text back into a JavaScript object 
    const data = JSON.parse(savedData);

    // Restore general data, default 0 or 1 there is no property
    this.game.döner = data.döner ?? 0;
    this.game.clickPower = data.clickPower ?? 1;

    // Restore building count and cost matching by name
    if (data.buildings) {
      data.buildings.forEach(savedBuilding => {
        const building = this.game.buildings.find(b => b.name === savedBuilding.name);
        if (building) {
          building.count = savedBuilding.count;
          building.cost = savedBuilding.cost;
        }
      });
    }

    // Restore saved upgrades
    if (data.upgrades) {
      data.upgrades.forEach(savedUpgrade => {
        const upgrade = this.game.upgrades.find(u => u.name === savedUpgrade.name);
        if (!upgrade) return; // skip if the upgrade is not found in the current game

        // If upgrade was saved as purchased, apply the effect and delete the html element
        if (savedUpgrade.purchased && !upgrade.purchased) {
          upgrade.purchased = true;
          
          // Re-apply building spped/production multiplier 
          const targetBuilding = this.game.buildings.find(b => b.name === upgrade.buildingName);
          if (targetBuilding && upgrade.multiplier) {
            targetBuilding.dps *= upgrade.multiplier;
          }

          // Remove the upgrade element from the DOM -screen- so player can't buy it again
          if (upgrade.element) {
            upgrade.element.remove();
          }
        }

        // Restore leveled upgrades if there is any
        if (savedUpgrade.level !== null && savedUpgrade.level !== undefined) {
          upgrade.level = savedUpgrade.level;
          upgrade.cost = savedUpgrade.cost;
          upgrade.requiredCount = savedUpgrade.requiredCount;

          // If the upgrade has reached its max level, mark it as purchased and remove it from the UI
          if (upgrade.level >= upgrade.maxLevel) {
            upgrade.purchased = true;
            if (upgrade.element) upgrade.element.remove();
          }
        }
      });
    }

    // Refresh the UI elements -buttons - counters 
    this.game.updateUI();

    // Show popup if player manually clicked load button
    if (manual) {
      this.game.showPopup('Je voortgang is geladen!', 'Spel Geladen');
    }
  }

  // RESET METHOD
  reset() {
    this.isResetting = true; // Set is resetting to true to prevent auto-save from overwriting the reset
    localStorage.removeItem(this.storageKey); // Delete saved data from localStorage

    // Show custom popup before reloading
    this.game.showPopup('Je voortgang is gewist. Het spel wordt nu herstart.', 'Voortgang Gewist');

    // wait for players  to close the popup before reloading
    if (this.game.popupCloseBtn) {
      const handleResetClose = () => {
        // Remove event listener to prevent multiple reloads 
        this.game.popupCloseBtn.removeEventListener('click', handleResetClose);
        location.reload();
      };
      this.game.popupCloseBtn.addEventListener('click', handleResetClose);
    } else {
      // Fallback reload if popup close button is missing on the page 
      setTimeout(() => location.reload(), 1000);
    }
  }
}