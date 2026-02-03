// ---------- State ----------
let tick = 0;

// Initialize gameData with default values
let gameData = {
  tick: 0,
  prestigeLevel: 0,
  careerLevel: 0,
  semester: 1,
  energy: 100,
  maxEnergy: 100,
  energyRegen: 5,
  skill: 5,
  reputation: 0,
  stars: 0,
  offers: 0,
  gpa: 1.0,
  coffeeLevel: 0,
  streakLevel: 0
};

const tiers = [
  { name: "Carper Community College", repBoost: 1 },
  { name: "Sally State University", repBoost: 2 },
  { name: "Idyllic Institution", repBoost: 4 },
  { name: "HYPSM", repBoost: 8 },
  { name: "Grad School", repBoost: 16 },
  { name: "PhD Program", repBoost: 32 }
];

const careers = [
  { name: "Unemployed Graduate", boost: 1 },
  { name: "McDonald's Crew", boost: 10 },
  { name: "Walmart Associate", boost: 100 },
  { name: "Accountant", boost: 1000 },
  { name: "Supply Chain Manager", boost: 10000 },
  { name: "Software Engineer", boost: 100000 },
  { name: "Quant Researcher", boost: 1e6 },
  { name: "YC Investor", boost: 1e7 },
  { name: "Unicorn CEO", boost: 1e8 },
  { name: "Hedge Fund Manager", boost: 1e9 },
  { name: "Monopoly Owner", boost: 1e12 }
];

// ---------- DOM Elements ----------
const elements = {
  energy: document.getElementById("energy"),
  maxEnergy: document.getElementById("maxEnergy"),
  skill: document.getElementById("skill"),
  reputation: document.getElementById("reputation"),
  stars: document.getElementById("stars"),
  offers: document.getElementById("offers"),
  gpa: document.getElementById("gpa"),
  tick: document.getElementById("tick"),
  tierName: document.getElementById("tierName"),
  semester: document.getElementById("semester"),
  careerName: document.getElementById("careerName"),
  log: document.getElementById("log"),
  tiersList: document.getElementById("tiersList"),
  coffeeLevel: document.getElementById("coffeeLevel"),
  coffeeCost: document.getElementById("coffeeCost"),
  streakLevel: document.getElementById("streakLevel"),
  streakCost: document.getElementById("streakCost"),
  btnPrestige: document.getElementById("btnPrestige"),
  btnCareerPrestige: document.getElementById("btnCareerPrestige")
};

// ---------- Save/Load System ----------
function saveGame() {
  localStorage.setItem("githubGrindSave", JSON.stringify(gameData));
  log("Game Saved.");
}

function loadGame() {
  const savedData = localStorage.getItem("githubGrindSave");
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    // Merge saved data into gameData to handle potential new version updates
    gameData = { ...gameData, ...parsedData };
    log("Game Loaded.");
  }
  render();
}

// ---------- Helpers ----------
function log(msg) { elements.log.textContent = msg; }
function currentTier() { return tiers[Math.min(gameData.prestigeLevel, tiers.length - 1)]; }
function currentCareer() { return careers[Math.min(gameData.careerLevel, careers.length - 1)]; }
function totalRepMultiplier() { 
  return currentTier().repBoost * currentCareer().boost * (1 + gameData.streakLevel * 0.2); 
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function getCoffeeCost() { return Math.floor(10 * Math.pow(1.5, gameData.coffeeLevel)); }
function getStreakCost() { return Math.floor(50 * Math.pow(1.6, gameData.streakLevel)); }

// ---------- Core Actions ----------
function actionJoinClub() {
  if (gameData.energy < 10) { log("Too tired!"); return; }
  gameData.energy -= 10;
  gameData.skill += (3 + gameData.prestigeLevel);
  gameData.reputation += (0.8 * totalRepMultiplier());
  render();
}

function buyCoffee() {
  const cost = getCoffeeCost();
  if (gameData.reputation >= cost) {
    gameData.reputation -= cost;
    gameData.coffeeLevel++;
    gameData.energyRegen += 1.5;
    log("Upgraded caffeine intake!");
    render();
  }
}

function buyStreak() {
  const cost = getStreakCost();
  if (gameData.reputation >= cost) {
    gameData.reputation -= cost;
    gameData.streakLevel++;
    log("Streak maintained.");
    render();
  }
}

// ---------- Engine ----------
function render() {
  elements.energy.textContent = Math.floor(gameData.energy);
  elements.maxEnergy.textContent = gameData.maxEnergy;
  elements.skill.textContent = gameData.skill.toFixed(1);
  elements.reputation.textContent = Math.floor(gameData.reputation).toLocaleString();
  elements.stars.textContent = Math.floor(gameData.stars);
  elements.offers.textContent = gameData.offers;
  elements.gpa.textContent = gameData.gpa.toFixed(2);
  elements.tick.textContent = gameData.tick;

  elements.tierName.textContent = currentTier().name;
  elements.semester.textContent = gameData.semester;
  elements.careerName.textContent = currentCareer().name;

  elements.coffeeLevel.textContent = gameData.coffeeLevel;
  elements.coffeeCost.textContent = getCoffeeCost();
  elements.streakLevel.textContent = gameData.streakLevel;
  elements.streakCost.textContent = getStreakCost();

  elements.btnPrestige.disabled = gameData.offers < 5;
  elements.btnCareerPrestige.disabled = !(gameData.prestigeLevel >= tiers.length - 1 && gameData.offers >= 20);

  // Update Tiers visual list
  elements.tiersList.innerHTML = "";
  tiers.forEach((t, i) => {
    const li = document.createElement("li");
    li.style.opacity = i > gameData.prestigeLevel ? "0.4" : "1";
    li.style.color = i === gameData.prestigeLevel ? "#4f5ed1" : "white";
    li.textContent = (i === gameData.prestigeLevel ? "▶ " : "") + t.name;
    elements.tiersList.appendChild(li);
  });
}

function gameTick() {
  gameData.tick++;
  gameData.energy = clamp(gameData.energy + gameData.energyRegen, 0, gameData.maxEnergy);
  gameData.reputation += (0.1 * totalRepMultiplier());
  
  // Autosave every 30 seconds
  if (gameData.tick % 30 === 0) saveGame();
  
  render();
}

// ---------- Init ----------
document.getElementById("btnCoffee").onclick = buyCoffee;
document.getElementById("btnStreak").onclick = buyStreak;
document.getElementById("btnJoinClub").onclick = actionJoinClub;
// Add other listeners similarly...

loadGame();
setInterval(gameTick, 1000);