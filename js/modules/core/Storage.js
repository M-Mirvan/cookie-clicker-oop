import { SKIN_STAGES } from '../progression/Data.js';

export class StorageManager {
  constructor(game, storageKey = 'donerGameSave') {
    this.game = game;
    this.storageKey = storageKey;
    this.isResetting = false; // Prevents auto-save from overwriting on reload
  }

  // SAVE METHOD
  save(manual = false) {
    if (this.isResetting) return; // Stop saving if a reset is currently happening 

    // Gather all relevant game data into a single object 
    const saveData = {
      döner: this.game.döner, // Döner you have 
      clickPower: this.game.clickPower, // Current click power
      currentSkinId: this.game.visuals?.currentSkinId || 'wrap', // Save active skin stage ID
      unlockedSkins: Array.from(this.game.visuals?.unlockedSkins || ['wrap']), // Convert Set to Array for JSON storage
      buildings: this.game.buildings.map(building => ({ 
        name: building.name, 
        count: building.count, 
        cost: building.cost 
      })),
      upgrades: this.game.upgrades.map(upgrade => ({ 
        name: upgrade.name,
        purchased: upgrade.purchased,
        level: upgrade.level ?? null, 
        cost: upgrade.cost,
        requiredCount: upgrade.requiredCount ?? null
      }))
    };

    // Save the data to localStorage as a JSON text string 
    localStorage.setItem(this.storageKey, JSON.stringify(saveData));
    
    // Show a popup if the player manually saved the game
    if (manual) {
      this.game.showPopup('Je voortgang is succesvol opgeslagen!', 'Spel Opgeslagen');
    }
  }

  // LOAD METHOD
  load(manual = false) {
    const savedData = localStorage.getItem(this.storageKey); // Retrieve the saved data from localStorage

    // Handle case when no saved data is found
    if (!savedData) {
      if (manual) {
        this.game.showPopup('Er is geen opgeslagen spel gevonden.', 'Geen Save');
      }
      return; // No data to load, exit function
    }

    // Convert saved JSON text back into a JavaScript object 
    const data = JSON.parse(savedData);

    // Restore general data (fallback defaults if missing)
    this.game.döner = data.döner ?? 0;
    this.game.clickPower = data.clickPower ?? 1;

    // Restore unlocked skins Set
    if (data.unlockedSkins && this.game.visuals) {
      this.game.visuals.unlockedSkins = new Set(data.unlockedSkins);
    }

    // Restore active skin/stage image
    if (data.currentSkinId && this.game.visuals) {
      this.game.visuals.currentSkinId = data.currentSkinId;
      const activeStage = SKIN_STAGES.find(s => s.id === data.currentSkinId);
      if (activeStage) {
        this.game.visuals.updateClickerSkin(activeStage.image);
      }
    }

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
        if (!upgrade) return; // Skip if upgrade not found in current game definitions

        // If upgrade was saved as purchased, apply the effect and delete the HTML element
        if (savedUpgrade.purchased && !upgrade.purchased) {
          upgrade.purchased = true;
          
          // Re-apply building speed/production multiplier 
          const targetBuilding = this.game.buildings.find(b => b.name === upgrade.buildingName);
          if (targetBuilding && upgrade.multiplier) {
            targetBuilding.dps *= upgrade.multiplier;
          }

          // Remove the upgrade element from the DOM screen
          if (upgrade.element) {
            upgrade.element.remove();
          }
        }

        // Restore leveled upgrades if applicable
        if (savedUpgrade.level !== null && savedUpgrade.level !== undefined) {
          upgrade.level = savedUpgrade.level;
          upgrade.cost = savedUpgrade.cost;
          upgrade.requiredCount = savedUpgrade.requiredCount;

          // If upgrade reached max level, mark as purchased and remove from UI
          if (upgrade.level >= upgrade.maxLevel) {
            upgrade.purchased = true;
            if (upgrade.element) upgrade.element.remove();
          }
        }
      });
    }

    // Refresh UI elements
    this.game.updateUI();

    // Show popup if player manually clicked load button
    if (manual) {
      this.game.showPopup('Je voortgang is geladen!', 'Spel Geladen');
    }
  }

  // RESET METHOD
  reset() {
    this.isResetting = true; // Prevent auto-save from overwriting the reset
    localStorage.removeItem(this.storageKey); // Delete saved data from localStorage

    // Show custom popup before reloading
    this.game.showPopup('Je voortgang is gewist. Het spel wordt nu herstart.', 'Voortgang Gewist');

    // Wait for player to close popup before reloading page
    if (this.game.popupCloseBtn) {
      const handleResetClose = () => {
        this.game.popupCloseBtn.removeEventListener('click', handleResetClose);
        location.reload();
      };
      this.game.popupCloseBtn.addEventListener('click', handleResetClose);
    } else {
      setTimeout(() => location.reload(), 1000);
    }
  }
}