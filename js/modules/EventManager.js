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

    this.container = document.getElementById('events-banner') || this.createBannerContainer();
  }

  createBannerContainer() {
    const banner = document.createElement('div');
    banner.id = 'events-banner';
    banner.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 1000; display: flex; flex-direction: column; gap: 8px;';
    document.body.appendChild(banner);
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
    if (this.eventPool.length === 0) return;

    const available = this.eventPool.filter(eData => {
      const isActive = this.activeEvents.some(active => active.id === eData.id);
      const conditionMet = typeof eData.triggerCondition === 'function' ? eData.triggerCondition(this.game) : true;
      return !isActive && conditionMet;
    });

    if (available.length === 0) return;

    const template = available[Math.floor(Math.random() * available.length)];
    const eventInstance = new GameEvent(template);

    this.activeEvents.push(eventInstance);

    if (typeof eventInstance.onStart === 'function') {
      eventInstance.onStart(this.game);
    }

    this.renderEventUI(eventInstance);
    this.game.showPopup(eventInstance.description, `⚡ EVENT STARTED: ${eventInstance.name}!`);
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
    card.style.cssText = 'background: #222; color: #fff; border: 2px solid #f39c12; padding: 10px; borderRadius: 6px; minWidth: 200px; boxShadow: 0 4px 6px rgba(0,0,0,0.3);';
    card.innerHTML = `
      <strong style="color: #f39c12;">${event.name}</strong>
      <p style="margin: 4px 0; fontSize: 12px;">${event.description}</p>
      <small style="color: #aaa;">Time left: <span class="time-left">${event.timeRemaining}</span>s</small>
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
console.log('EventManager.js.');