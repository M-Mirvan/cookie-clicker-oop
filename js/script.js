/*let clickDöner = 0; 
let restorant = 0;
let Dönerzaakcost = 40;

let worker = 0;
let workercost = 10;

let robotfactory = 0;
let robotfactorycost = 120;

const clickDönerDPS = {
    restorant: 2,
    worker: 1,
    robotfactory: 4
};

//cps logic
document.getElementById('clickDöner').addEventListener('click', function() {
    clickDöner++; 
    document.getElementById('clickCount').innerText = clickDöner;
});
//1st factory logic
document.getElementById('restorant').addEventListener('click', function() {
    if (clickDöner >= Dönerzaakcost) {
        clickDöner -= Dönerzaakcost; 
        restorant += 1;

        Dönerzaakcost = Math.ceil(Dönerzaakcost * 1.5);

        document.getElementById('clickCount').innerText = clickDöner;
        document.getElementById('restorantCount').innerText = restorant;
        document.getElementById('restorantcostdisplay').innerText = Dönerzaakcost;
    } else {
        alert(`Not enough Döner! You need ${Dönerzaakcost} Döner to buy a restorant.`);
    }
});

//factory cps
/*setInterval(function() {
    if (clickDöner <= workercost) {
        clickDöner += (restorant * 2);
        
        document.getElementById('clickCount').innerText = clickDöner; 
    }
        if (robotfactory > 0) {
        clickDöner += (robotfactory * 4); 
        
        document.getElementById('clickCount').innerText = clickDöner; 
    }
        if (worker > 0) {
        clickDöner += (worker * 1); 
        
        document.getElementById('clickCount').innerText = clickDöner; 

    }

}, 1000);
*/
/*function updateIncome() {
    let income = (restorant * clickDönerDPS.restorant) + 
    (worker * clickDönerDPS.worker) + 
    (robotfactory * clickDönerDPS.robotfactory);
    document.getElementById('income').innerText = income;

    return income;
}

setInterval (function(){
    let income = updateIncome();
    clickDöner += income;
    document.getElementById('clickCount').innerText = clickDöner;
}, 1000);

//2nd factory logic
document.getElementById('factory2').addEventListener('click', function() {
    if (clickDöner >= workercost) {
        clickDöner -= workercost; 
        worker += 1;

        workercost = Math.ceil(workercost * 1.8);

        document.getElementById('clickCount').innerText = clickDöner;
        document.getElementById('workerCount').innerText = worker;
        document.getElementById('workercostdisplay').innerText = workercost;
    } else {
        alert(`Not enough Döner! You need ${workercost} Döner to buy a worker.`);
    }

});




//1st factory logic
document.getElementById('robotfactory').addEventListener('click', function() {
    if (clickDöner >= robotfactorycost) {
        clickDöner -= robotfactorycost; 
        robotfactory += 1;

        robotfactorycost = Math.ceil(robotfactorycost * 1.25);

        document.getElementById('clickCount').innerText = clickDöner;
        document.getElementById('robotfactoryCount').innerText = robotfactory;
        document.getElementById('robotfactorycostdisplay').innerText = robotfactorycost;
    } else {
        alert(`Not enough Döner! You need ${robotfactorycost} Döner to buy a robot factory.`);
    }
});


function updateIncome() {
    let income = (restorant * clickDönerDPS.restorant) + 
    (worker * clickDönerDPS.worker) + 
    (robotfactory * clickDönerDPS.robotfactory);
    document.getElementById('income').innerText = income;

    return income;
}
updateIncome(); */



// 1. Game State Class
class Game {
  constructor() {

    this.döner = 0;
    this.buildings = [];
    
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

    // Create building element
    this.element = document.createElement('div');
    this.element.className = 'building-item';

    this.element.innerHTML = `
        <button class="buy-btn">${this.name}</button>
        <p>Count: <span class="count">0</span></p>
        <p>Cost: <span class="cost">${this.cost}</span> Döner</p>
    `;
    
    this.button = this.element.querySelector('.buy-btn');
    this.countDisplay = this.element.querySelector('.count');
    this.costDisplay = this.element.querySelector('.cost');

    // Append created building element to container
    const container = document.getElementById('buildings-list');
    if (container) {
      container.appendChild(this.element);
    }

    this.init();
  }

  init() {
    if (this.button) {
      this.button.addEventListener('click', () => this.buy());
    }
  }

  buy() {
    if (this.game.döner >= this.cost) {
      this.game.döner -= this.cost;
      this.count++;
      this.cost = Math.ceil(this.cost * this.costmultiplier);

      this.updateUI();
      this.game.updateUI();
    } else {
      alert(`Not enough Döner! You need ${this.cost} Döner to buy a ${this.name}.`);
    }
  }

  getIncome() {
    return this.count * this.dps;
  }

  updateUI() {
    if (this.countDisplay) this.countDisplay.innerText = this.count;
    if (this.costDisplay) this.costDisplay.innerText = this.cost;
  }
}

// 3. Game and Register Buildings
const game = new Game();

// Clean configuration array with balanced base costs
const buildingData = [
  { name: 'Worker', baseCost: 10, costMultiplier: 1.8, dps: 1 },
  { name: 'Restorant', baseCost: 40, costMultiplier: 1.5, dps: 2 },
  { name: 'Robot Factory', baseCost: 120, costMultiplier: 1.25, dps: 4 },
  { name: 'Turks Pizza', baseCost: 250, costMultiplier: 1.2, dps: 6 },
  { name: 'Doner Stand', baseCost: 500, costMultiplier: 1.4, dps: 10 },
  { name: 'Doner Factory', baseCost: 1000, costMultiplier: 1.3, dps: 20 }
];

buildingData.forEach(data => {  
  game.addBuilding(new Building(game, data));
});

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