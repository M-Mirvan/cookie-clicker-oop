import { SKIN_STAGES } from './Data.js';

export class Visuals {
  constructor(game, clickerImgId = 'clickDöner') {
    this.game = game;
    this.clickerImgId = clickerImgId;
    this.clickerImg = document.getElementById(clickerImgId);
    
    // Track all unlocked skin IDs permanently so if you have under 50 k you dont go back to the wrap skin
    this.unlockedSkins = new Set(['wrap']);
    this.currentSkinId = 'wrap';
  }

  // Evaluates stage unlocks on game loop ticks
  checkSkinProgression() {
    if (!this.clickerImg) {
      this.clickerImg = document.getElementById(this.clickerImgId);
      if (!this.clickerImg) return;
    }

    // 1. Permanently record any newly qualified stage unlocks
    SKIN_STAGES.forEach((stage) => {
      if (!this.unlockedSkins.has(stage.id) && stage.requirement(this.game)) {
        this.unlockedSkins.add(stage.id);
        
        // Show popup notification for the new milestone
        if (typeof this.game.showPopup === 'function') {
          this.game.showPopup(`Gefeliciteerd! Je hebt een nieuwe stage ontgrendeld: ${stage.name}!`, 'STAGE UNLOCKED');
        }
      }
    });

    // 2. Apply the highest stage that has been permanently unlocked
    for (let i = SKIN_STAGES.length - 1; i >= 0; i--) {
      const stage = SKIN_STAGES[i];
      if (this.unlockedSkins.has(stage.id)) {
        if (this.currentSkinId !== stage.id) {
          this.currentSkinId = stage.id;
          this.updateClickerSkin(stage.image);
        }
        break; // Stop loop when last unlocked stage is found
      }
    }
  }

  // Updates clicker image source in the DOM
  updateClickerSkin(skinImagePath) {
    if (!this.clickerImg) {
      this.clickerImg = document.getElementById(this.clickerImgId);
    }
    
    if (this.clickerImg) {
      this.clickerImg.src = skinImagePath;
      this.triggerSquishAnimation();
    }
  }

  // Click squish animation feedback
  triggerSquishAnimation() {
    if (!this.clickerImg) return;
    this.clickerImg.classList.add('squish');
    setTimeout(() => this.clickerImg.classList.remove('squish'), 100);
  }
}