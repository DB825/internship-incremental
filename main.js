// ---------- Game State ----------
const defaultState = {
  tick: 0,
  prestigeLevel: 0,
  careerLevel: 0,
  semester: 1,
  energy: 100,
  maxEnergy: 100,
  energyRegen: 5,
  skill: 0,
  reputation: 0,
  stars: 0,
  offers: 0,
  gpa: 1.0,
  coffeeLevel: 0,
  streakLevel: 0
};

let gameData = JSON.parse(JSON.stringify(defaultState));

// ---------- Config / Data ----------
const tiers = [
  { name: "Carper Community College", repBoost: 1 },
  { name: "Sally State University", repBoost: 2 },
  { name: "Idyllic Institute", repBoost: 4 },
  { name: "HYPSM", repBoost: 8 },
  { name: "Grad School", repBoost: 16 },
  { name: "PhD Program", repBoost: 32 }
];

const careers = [
  { name: "Unemployed", boost: 1 },
  { name: "McDonald's Crew", boost: 10 },
  { name: "Walmart Associate", boost: 100 },
  { name: "Accountant", boost: 1000 },
  { name: "Software Engineer", boost: 10000 },
  { name: "Quant Researcher", boost: 1e6 },
  { name: "Tech CEO", boost: 1e9 }
];

// ---------- DOM Cache ----------
const ui = {
  energy: document.getElementById("energy"),
  maxEnergy: document.getElementById("maxEnergy"),
  energyBar: document.getElementById("energyBar"),
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
  btnCareerPrestige: document.getElementById("btnCareerPrestige"),
  btnCoffee: document.getElementById("btnCoffee"),
  btnStreak: document.getElementById("btnStreak")
};

// ---------- Audio ----------
const sfxClick = document.getElementById("sfx-click");
const sfxOffer = document.getElementById("sfx-offer");

function playSound(sound) {
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {}); // catch interaction errors
  }
}

// ---------- Logic Helpers ----------
function currentTier() { return tiers[Math.min(gameData.prestigeLevel, tiers.length - 1)]; }
function currentCareer() { return careers[Math.min(gameData.careerLevel, careers.length - 1)]; }

function totalRepMultiplier() {
  return currentTier().repBoost * currentCareer().boost * (1 + gameData.streakLevel * 0.2);
}

function getCoffeeCost() { return Math.floor(10 * Math.pow(1.5, gameData.coffeeLevel)); }
function getStreakCost() { return Math.floor(50 * Math.pow(1.6, gameData.streakLevel)); }

function log(msg) {
  ui.log.innerText = msg;
  ui.log.style.animation = "none";
  ui.log.offsetHeight; /* trigger reflow */
  ui.log.style.animation = "pulse 0.5s";
}

// ---------- Rendering ----------
function updateUI() {
  // Stats
  ui.energy.innerText = Math.floor(gameData.energy);
  ui.maxEnergy.innerText = gameData.maxEnergy;
  ui.skill.innerText = gameData.skill.toFixed(1);
  ui.reputation.innerText = Math.floor(gameData.reputation).toLocaleString();
  ui.stars.innerText = Math.floor(gameData.stars);
  ui.offers.innerText = gameData.offers;
  ui.gpa.innerText = gameData.gpa.toFixed(2);
  ui.tick.innerText = gameData.tick;

  // Energy Bar Width
  const pct = Math.max(0, Math.min(100, (gameData.energy / gameData.maxEnergy) * 100));
  ui.energyBar.style.width = pct + "%";

  // Header Info
  ui.tierName.innerText = currentTier().name;
  ui.semester.innerText = gameData.semester;
  ui.careerName.innerText = currentCareer().name;

  // Upgrades
  const coffeeCost = getCoffeeCost();
  const streakCost = getStreakCost();

  ui.coffeeLevel.innerText = gameData.coffeeLevel;
  ui.coffeeCost.innerText = coffeeCost.toLocaleString();
  ui.btnCoffee.disabled = gameData.reputation < coffeeCost;

  ui.streakLevel.innerText = gameData.streakLevel;
  ui.streakCost.innerText = streakCost.toLocaleString();
  ui.btnStreak.disabled = gameData.reputation < streakCost;

  // Prestige Buttons
  ui.btnPrestige.disabled = gameData.offers < 5;
  const canCareer = gameData.prestigeLevel >= tiers.length - 1 && gameData.offers >= 20;
  ui.btnCareerPrestige.disabled = !canCareer;
  ui.btnCareerPrestige.style.opacity = canCareer ? "1" : "0.5";

  // Tier List Visualization
  ui.tiersList.innerHTML = "";
  tiers.forEach((t, i) => {
    const li = document.createElement("li");
    li.innerText = t.name + ` (x${t.repBoost})`;
    if (i === gameData.prestigeLevel) {
      li.className = "tier-active";
      li.innerText = "▶ " + li.innerText;
    } else if (i > gameData.prestigeLevel) {
      li.style.opacity = "0.3";
    } else {
      li.style.opacity = "0.7";
      li.style.textDecoration = "line-through";
    }
    ui.tiersList.appendChild(li);
  });
}

// ---------- Actions ----------
function spendEnergy(amount) {
  if (gameData.energy >= amount) {
    gameData.energy -= amount;
    return true;
  }
  log("Not enough energy! Wait for regen.");
  return false;
}

function basicAction(energyCost, skillGain, repGain, logMsg) {
  if (spendEnergy(energyCost)) {
    playSound(sfxClick);
    gameData.skill += (skillGain + gameData.prestigeLevel);
    gameData.reputation += (repGain * totalRepMultiplier());
    log(logMsg);
    updateUI();
  }
}

// Button Listeners
document.getElementById("btnJoinClub").onclick = () => 
  basicAction(10, 3, 0.8, "Joined a club meeting.");

document.getElementById("btnStudy").onclick = () => {
  if (spendEnergy(15)) {
    playSound(sfxClick);
    gameData.skill += (6 + gameData.prestigeLevel * 2);
    gameData.gpa = Math.min(4.0, gameData.gpa + 0.05);
    log("Studied hard. GPA increased.");
    updateUI();
  }
};

document.getElementById("btnBuildProject").onclick = () => {
  if (spendEnergy(25)) {
    playSound(sfxClick);
    gameData.stars += (1 + Math.floor(gameData.skill / 20));
    gameData.skill += 4;
    gameData.reputation += (2 * totalRepMultiplier());
    log("Built a cool project.");
    updateUI();
  }
};

document.getElementById("btnApplyResearch").onclick = () => {
  if (spendEnergy(30)) {
    playSound(sfxClick);
    if (Math.random() < 0.5) {
      gameData.skill += 10;
      gameData.reputation += 6;
      log("Got the research position!");
    } else {
      log("Professor ghosted you.");
    }
    updateUI();
  }
};

document.getElementById("btnApplyInternship").onclick = () => {
  if (spendEnergy(40)) {
    playSound(sfxClick);
    const chance = 0.15 + (gameData.skill / 200) + (gameData.stars / 100);
    if (Math.random() < chance) {
      gameData.offers++;
      gameData.reputation += 20;
      playSound(sfxOffer);
      log("OFFER RECEIVED!");
    } else {
      log("Rejected. LeetCode more.");
    }
    updateUI();
  }
};

// Upgrades
ui.btnCoffee.onclick = () => {
  const cost = getCoffeeCost();
  if (gameData.reputation >= cost) {
    gameData.reputation -= cost;
    gameData.coffeeLevel++;
    gameData.energyRegen += 1.5;
    playSound(sfxClick);
    log("Caffeine loaded. Regen Up.");
    updateUI();
  }
};

ui.btnStreak.onclick = () => {
  const cost = getStreakCost();
  if (gameData.reputation >= cost) {
    gameData.reputation -= cost;
    gameData.streakLevel++;
    playSound(sfxClick);
    log("Streak maintained. Multipliers Up.");
    updateUI();
  }
};

// Prestige
ui.btnPrestige.onclick = () => {
  if (gameData.offers >= 5) {
    gameData.prestigeLevel++;
    gameData.semester++;
    // Soft Reset
    gameData.energy = 100;
    gameData.skill = 10 * gameData.prestigeLevel;
    gameData.gpa = 3.0;
    gameData.offers = 0;
    gameData.stars = 0;
    log("Welcome to " + currentTier().name);
    playSound(sfxOffer);
    updateUI();
  }
};

ui.btnCareerPrestige.onclick = () => {
  if (gameData.prestigeLevel >= tiers.length - 1 && gameData.offers >= 20) {
    gameData.careerLevel++;
    // Hard Reset Logic would go here
    gameData = JSON.parse(JSON.stringify(defaultState));
    gameData.careerLevel = 1; // Example increment
    log("Promoted to " + currentCareer().name);
    updateUI();
  }
};

document.getElementById("btnSave").onclick = () => {
  saveGame();
  log("Game Saved.");
};

// ---------- System ----------
function saveGame() {
  localStorage.setItem("githubGrindSave", JSON.stringify(gameData));
}

function loadGame() {
  const save = localStorage.getItem("githubGrindSave");
  if (save) {
    try {
      const savedData = JSON.parse(save);
      gameData = { ...gameData, ...savedData };
    } catch (e) {
      console.error("Save file corrupted");
    }
  }
  updateUI();
}

function gameTick() {
  gameData.tick++;
  // Passive Logic
  gameData.energy = Math.min(gameData.maxEnergy, gameData.energy + gameData.energyRegen);
  gameData.reputation += (0.1 * totalRepMultiplier()); // Passive Rep
  
  if (gameData.tick % 10 === 0) saveGame();
  updateUI();
}

// Init
loadGame();
setInterval(gameTick, 1000);