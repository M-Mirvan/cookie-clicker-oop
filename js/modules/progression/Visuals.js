import { SKIN_STAGES } from './Data.js';

export class Visuals {
  constructor(game, clickerImgId = 'clickDöner') {
    this.game = game;
    this.clickerImgId = clickerImgId;
    this.clickerImg = document.getElementById(clickerImgId);
    
    // Track all unlocked skin IDs permanently so if you spend Döner you don't lose your skin
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
          
          // Update clicker image artwork
          this.updateClickerSkin(stage.image);

          // Update theme styling on document body
          this.applyStageTheme(stage.themeClass);
        }
        break; // Stop loop once highest unlocked stage is found
      }
    }
  }

  // Updates theme classes on <body>
  applyStageTheme(themeClass) {
    // Remove any previous theme classes from body
    SKIN_STAGES.forEach((s) => {
      if (s.themeClass) {
        document.body.classList.remove(s.themeClass);
      }
    });

    // Add the new theme class if one exists for this stage
    if (themeClass) {
      document.body.classList.add(themeClass);
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