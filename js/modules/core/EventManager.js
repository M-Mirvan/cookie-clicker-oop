export class GameEvent {
  constructor({ id, name, description, duration, globalMultiplier = 1, buildingMultipliers = {}, clickPowerMultiplier = 1, triggerCondition = null, onStart = null, onEnd = null }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.duration = duration;
    this.timeRemaining = duration;
    
    this.globalMultiplier = globalMultiplier;
    this.buildingMultipliers = buildingMultipliers;
    this.clickPowerMultiplier = clickPowerMultiplier;
    this.triggerCondition = triggerCondition;
    
    this.onStart = onStart;
    this.onEnd = onEnd;
  }
}

export class EventManager {
  constructor(game, options = {}) {
    this.game = game;
    this.eventPool = [];
    this.activeEvents = [];
    
    this.checkInterval = options.checkInterval || 10;
    this.chancePerCheck = options.chancePerCheck || 0.3;
    this.timer = 0;

    this.container = this.getOrCreateBannerContainer();
  }

  getOrCreateBannerContainer() {
    let banner = document.getElementById('events-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'events-banner';
      document.body.appendChild(banner);
    }
    banner.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
    return banner;
  }

  registerEvent(eventData) {
    this.eventPool.push(eventData);
  }

  tick() {
    for (let i = this.activeEvents.length - 1; i >= 0; i--) {
      const event = this.activeEvents[i];
      event.timeRemaining--;

      this.updateEventUI(event);

      if (event.timeRemaining <= 0) {
        this.endEvent(event, i);
      }
    }

    this.timer++;
    if (this.timer >= this.checkInterval) {
      this.timer = 0;
      if (Math.random() < this.chancePerCheck) {
        this.triggerRandomEvent();
      }
    }
  }

  triggerRandomEvent() {
    if (this.eventPool.length === 0) {
      console.warn('EventManager: No events registered in eventPool!');
      return;
    }

    // Filter available events on conditions and active status
    const available = this.eventPool.filter(eData => {
      const isActive = this.activeEvents.some(active => active.id === eData.id);
      const conditionMet = typeof eData.triggerCondition === 'function' ? eData.triggerCondition(this.game) : true;
      return !isActive && conditionMet;
    });

    if (available.length === 0) {
      console.log('EventManager: Events exist, but no event conditions were met right now.');
      return;
    }

    const template = available[Math.floor(Math.random() * available.length)];
    const eventInstance = new GameEvent(template);

    this.activeEvents.push(eventInstance);

    if (typeof eventInstance.onStart === 'function') {
      eventInstance.onStart(this.game);
    }

    this.renderEventUI(eventInstance);
    
    if (typeof this.game.showPopup === 'function') {
      this.game.showPopup(eventInstance.description, `EVENT STARTED: ${eventInstance.name}!`);
    }
  }

  endEvent(event, index) {
    this.activeEvents.splice(index, 1);

    if (typeof event.onEnd === 'function') {
      event.onEnd(this.game);
    }

    const element = document.getElementById(`event-card-${event.id}`);
    if (element) element.remove();

    this.game.updateUI();
  }

  getGlobalMultiplier() {
    return this.activeEvents.reduce((mult, e) => mult * e.globalMultiplier, 1);
  }

  getBuildingMultiplier(buildingName) {
    return this.activeEvents.reduce((mult, e) => {
      const bMult = e.buildingMultipliers[buildingName] || 1;
      return mult * bMult;
    }, 1);
  }

  getClickPowerMultiplier() {
    return this.activeEvents.reduce((mult, e) => mult * e.clickPowerMultiplier, 1);
  }

  renderEventUI(event) {
    const card = document.createElement('div');
    card.id = `event-card-${event.id}`;
    card.className = 'event-card';
    card.style.cssText = 'background: #1e1e24; color: #fff; border: 2px solid #f39c12; padding: 12px 16px; border-radius: 8px; min-width: 220px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); pointer-events: auto; font-family: sans-serif;';
    card.innerHTML = `
      <strong style="color: #f39c12; font-size: 15px; display: block; margin-bottom: 4px;">${event.name}</strong>
      <p style="margin: 0 0 6px 0; font-size: 13px; color: #ddd;">${event.description}</p>
      <small style="color: #aaa; font-size: 11px;">Time left: <span class="time-left" style="color: #f1c40f; font-weight: bold;">${event.timeRemaining}</span>s</small>
    `;
    this.container.appendChild(card);
  }

  updateEventUI(event) {
    const card = document.getElementById(`event-card-${event.id}`);
    if (card) {
      const timeSpan = card.querySelector('.time-left');
      if (timeSpan) timeSpan.innerText = event.timeRemaining;
    }
  }
}