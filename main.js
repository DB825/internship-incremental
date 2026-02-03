// ---------- State ----------
let tick = 0;

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

let prestigeLevel = 0;
let careerLevel = 0;
let semester = 1;

// Starting Stats
let energy = 100;
let maxEnergy = 100;
let energyRegen = 5;

let skill = 5;
let reputation = 0;
let stars = 0;
let offers = 0;
let gpa = 1.0;

// Upgrades
let coffeeLevel = 0;
let streakLevel = 0;

// ---------- Sound ----------
const clickSound = document.getElementById("sfx-click");
const offerSound = document.getElementById("sfx-offer");

function playClick() {
  if (!clickSound) return;
  clickSound.currentTime = 0;
  clickSound.play();
}

function playOffer() {
  if (!offerSound) return;
  offerSound.currentTime = 0;
  offerSound.play();
}

// ---------- DOM ----------
const energySpan = document.getElementById("energy");
const maxEnergySpan = document.getElementById("maxEnergy");
const skillSpan = document.getElementById("skill");
const reputationSpan = document.getElementById("reputation");
const starsSpan = document.getElementById("stars");
const offersSpan = document.getElementById("offers");
const gpaSpan = document.getElementById("gpa");
const tickSpan = document.getElementById("tick");

const tierNameSpan = document.getElementById("tierName");
const semesterSpan = document.getElementById("semester");
const careerNameSpan = document.getElementById("careerName");

const logP = document.getElementById("log");
const tiersList = document.getElementById("tiersList");

const btnJoinClub = document.getElementById("btnJoinClub");
const btnStudy = document.getElementById("btnStudy");
const btnBuildProject = document.getElementById("btnBuildProject");
const btnApplyResearch = document.getElementById("btnApplyResearch");
const btnApplyInternship = document.getElementById("btnApplyInternship");
const btnPrestige = document.getElementById("btnPrestige");
const btnCareerPrestige = document.getElementById("btnCareerPrestige");

const coffeeLevelSpan = document.getElementById("coffeeLevel");
const coffeeCostSpan = document.getElementById("coffeeCost");
const btnCoffee = document.getElementById("btnCoffee");

const streakLevelSpan = document.getElementById("streakLevel");
const streakCostSpan = document.getElementById("streakCost");
const btnStreak = document.getElementById("btnStreak");

// ---------- Helpers ----------
function log(msg) {
  logP.textContent = msg;
}

function currentTier() {
  return tiers[Math.min(prestigeLevel, tiers.length - 1)];
}

function currentCareer() {
  return careers[Math.min(careerLevel, careers.length - 1)];
}

function totalRepMultiplier() {
  return currentTier().repBoost * currentCareer().boost * (1 + streakLevel * 0.2);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function spendEnergy(cost) {
  if (energy < cost) {
    log("Too tired. Wait a few seconds.");
    return false;
  }
  energy -= cost;
  return true;
}

function gainSkill(amount) {
  skill += amount;
}

function gainReputation(baseAmount) {
  reputation += baseAmount * totalRepMultiplier();
}

function gainStars(amount) {
  stars += amount * (1 + streakLevel * 0.4);
}

function tryProbability(chance) {
  return Math.random() < chance;
}

// ---------- Actions ----------
function actionJoinClub() {
  if (!spendEnergy(10)) return;
  playClick();
  gainSkill(3 + prestigeLevel);
  gainReputation(0.8);
  log("Joined a club. Skill and reputation gained.");
  render();
}

function actionStudy() {
  if (!spendEnergy(15)) return;
  playClick();
  gainSkill(6 + prestigeLevel * 2);
  gpa = clamp(gpa + 0.05, 2.0, 4.0);
  log("Studied hard. GPA and skill increased.");
  render();
}

function actionBuildProject() {
  if (!spendEnergy(25)) return;
  playClick();
  const baseStars = 1 + Math.floor(skill / 15);
  gainStars(baseStars);
  gainSkill(4);
  gainReputation(2);
  log("Shipped a project. Stars and rep up.");
  render();
}

function actionApplyResearch() {
  if (!spendEnergy(30)) return;
  playClick();
  const chance = clamp(0.25 + skill / 120 + (gpa - 3.0) * 0.3, 0.15, 0.95);
  if (tryProbability(chance)) {
    gainSkill(10);
    gainReputation(6);
    gainStars(4);
    log("Research position secured!");
  } else {
    log("Ghosted by the professor.");
  }
  render();
}

function actionApplyInternship() {
  if (!spendEnergy(40)) return;
  playClick();
  const baseChance = 0.15 + skill / 180 + stars / 200;
  const chance = clamp(baseChance + (prestigeLevel * 0.05), 0.10, 0.9);
  if (tryProbability(chance)) {
    offers += 1;
    gainReputation(8);
    playOffer();
    log("Internship offer received!");
  } else {
    log("Rejected. Keep grinding.");
  }
  render();
}

// ---------- Upgrades ----------
function getCoffeeCost() { return Math.floor(10 * Math.pow(1.5, coffeeLevel)); }
function getStreakCost() { return Math.floor(50 * Math.pow(1.6, streakLevel)); }

function buyCoffee() {
  const cost = getCoffeeCost();
  if (reputation >= cost) {
    reputation -= cost;
    coffeeLevel++;
    energyRegen += 1.5; // Passive boost
    playClick();
    log("Bought coffee! Energy regen increased.");
    render();
  } else {
    log("Not enough Reputation for coffee.");
  }
}

function buyStreak() {
  const cost = getStreakCost();
  if (reputation >= cost) {
    reputation -= cost;
    streakLevel++;
    playClick();
    log("Maintaining the streak! Multipliers increased.");
    render();
  } else {
    log("Not enough Reputation to maintain streak.");
  }
}

// ---------- Prestige ----------
function canPrestige() { return offers >= 5; }

function prestige() {
  if (!canPrestige()) return;
  playClick();
  prestigeLevel++;
  semester++;
  energy = 100;
  maxEnergy = 100 + (prestigeLevel * 10);
  skill = 5 + (prestigeLevel * 5);
  stars = 0;
  offers = 0;
  gpa = 3.0;
  log("Moved to " + currentTier().name + "!");
  render();
}

function canCareerPrestige() {
  return prestigeLevel >= tiers.length - 1 && offers >= 20;
}

function careerPrestige() {
  if (!canCareerPrestige()) return;
  playOffer();
  careerLevel++;
  prestigeLevel = 0;
  semester = 1;
  energy = 100;
  maxEnergy = 100 + (careerLevel * 50);
  energyRegen = 5 + (careerLevel * 2);
  skill = 5 + (careerLevel * 10);
  reputation = 0;
  stars = 0;
  offers = 0;
  gpa = 1.0;
  coffeeLevel = 0;
  streakLevel = 0;
  log("CAREER UNLOCKED: " + currentCareer().name);
  render();
}

// ---------- Loop ----------
function render() {
  energySpan.textContent = Math.floor(energy);
  maxEnergySpan.textContent = maxEnergy;
  skillSpan.textContent = skill.toFixed(1);
  reputationSpan.textContent = Math.floor(reputation).toLocaleString();
  starsSpan.textContent = Math.floor(stars);
  offersSpan.textContent = offers;
  gpaSpan.textContent = gpa.toFixed(2);
  tickSpan.textContent = tick;

  tierNameSpan.textContent = currentTier().name;
  semesterSpan.textContent = semester;
  careerNameSpan.textContent = currentCareer().name;

  coffeeLevelSpan.textContent = coffeeLevel;
  coffeeCostSpan.textContent = getCoffeeCost();
  streakLevelSpan.textContent = streakLevel;
  streakCostSpan.textContent = getStreakCost();

  btnPrestige.disabled = !canPrestige();
  btnCareerPrestige.disabled = !canCareerPrestige();
  
  // Tiers List
  tiersList.innerHTML = "";
  tiers.forEach((t, i) => {
    const li = document.createElement("li");
    li.style.opacity = i > prestigeLevel ? "0.4" : "1";
    li.style.fontWeight = i === prestigeLevel ? "bold" : "normal";
    li.textContent = (i === prestigeLevel ? "▶ " : "") + t.name + " (x" + t.repBoost + ")";
    tiersList.appendChild(li);
  });
}

function gameTick() {
  tick++;
  energy = clamp(energy + energyRegen, 0, maxEnergy);
  gainReputation(0.1); // Base passive reputation
  render();
}

btnJoinClub.addEventListener("click", actionJoinClub);
btnStudy.addEventListener("click", actionStudy);
btnBuildProject.addEventListener("click", actionBuildProject);
btnApplyResearch.addEventListener("click", actionApplyResearch);
btnApplyInternship.addEventListener("click", actionApplyInternship);
btnPrestige.addEventListener("click", prestige);
btnCareerPrestige.addEventListener("click", careerPrestige);
btnCoffee.addEventListener("click", buyCoffee);
btnStreak.addEventListener("click", buyStreak);

setInterval(gameTick, 1000);
render();