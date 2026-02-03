// ---------- State ----------
let tick = 0;

const tiers = [
  { name: "Community College", repBoost: 1 },
  { name: "State University", repBoost: 2 },
  { name: "Top 50 University", repBoost: 4 },
  { name: "Top 10 University", repBoost: 8 },
  { name: "Graduate School", repBoost: 16 },
  { name: "PhD Program", repBoost: 32 }
];

let prestigeLevel = 0;
let semester = 1;

// better starting stats
let energy = 80;
let maxEnergy = 120;
let energyRegen = 4; // per tick

let skill = 20;
let reputation = 5;
let stars = 3;
let offers = 0;
let gpa = 3.2;

// upgrades
let coffeeLevel = 0;
let streakLevel = 0;

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
const prestigeLevelSpan = document.getElementById("prestigeLevel");
const semesterSpan = document.getElementById("semester");

const logP = document.getElementById("log");
const tiersList = document.getElementById("tiersList");

const btnJoinClub = document.getElementById("btnJoinClub");
const btnStudy = document.getElementById("btnStudy");
const btnBuildProject = document.getElementById("btnBuildProject");
const btnApplyResearch = document.getElementById("btnApplyResearch");
const btnApplyInternship = document.getElementById("btnApplyInternship");
const btnPrestige = document.getElementById("btnPrestige");

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

function totalRepMultiplier() {
  return currentTier().repBoost * (1 + streakLevel * 0.2);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// ---------- Actions ----------
function spendEnergy(cost) {
  if (energy < cost) {
    log("Too tired for that. Wait a bit to recover energy.");
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
  stars += amount * (1 + streakLevel * 0.5);
}

function tryProbability(chance) {
  return Math.random() < chance;
}

function actionJoinClub() {
  const cost = 10;
  if (!spendEnergy(cost)) return;
  gainSkill(2 + prestigeLevel * 0.5);
  gainReputation(0.7);
  log("You attended a dev club meeting and met some people.");
}

function actionStudy() {
  const cost = 15;
  if (!spendEnergy(cost)) return;
  gainSkill(4 + prestigeLevel);
  gpa = clamp(gpa + 0.03, 2.0, 4.0);
  log("You studied algorithms; skill and GPA went up.");
}

function actionBuildProject() {
  const cost = 25;
  if (!spendEnergy(cost)) return;
  const baseStars = 1 + Math.floor(skill / 25);
  gainStars(baseStars);
  gainSkill(3);
  gainReputation(1.5);
  log("You shipped a small GitHub project.");
}

function actionApplyResearch() {
  const cost = 30;
  if (!spendEnergy(cost)) return;

  const chance = clamp(0.15 + skill / 100 + (gpa - 3.0) * 0.25, 0.08, 0.9);
  if (tryProbability(chance)) {
    gainSkill(6);
    gainReputation(4.5);
    gainStars(3);
    log("You got into a research project!");
  } else {
    log("No response from professors this time.");
  }
}

function actionApplyInternship() {
  const cost = 40;
  if (!spendEnergy(cost)) return;

  const baseChance = 0.08 + skill / 160 + stars / 220;
  const tierBonus = prestigeLevel * 0.03;
  const chance = clamp(baseChance + tierBonus, 0.05, 0.85);

  if (tryProbability(chance)) {
    offers += 1;
    gainReputation(6.5);
    log("You received an internship offer!");
  } else {
    log("That application didn’t work out.");
  }
}

// ---------- Upgrades ----------
function coffeeCost(level) {
  return 10 * Math.pow(1.4, level);
}

function streakCost(level) {
  return 20 * Math.pow(1.5, level);
}

function buyCoffee() {
  const cost = coffeeCost(coffeeLevel);
  if (reputation < cost) {
    log("Not enough reputation to fuel that coffee habit.");
    return;
  }
  reputation -= cost;
  coffeeLevel += 1;
  energyRegen += 1;
  log("Coffee habit upgraded; energy regen increased.");
}

function buyStreak() {
  const cost = streakCost(streakLevel);
  if (reputation < cost) {
    log("Not enough reputation for a serious GitHub streak.");
    return;
  }
  reputation -= cost;
  streakLevel += 1;
  log("Your GitHub streak boosts stars and reputation.");
}

// ---------- Prestige ----------
function canPrestige() {
  return offers >= 5;
}

function prestige() {
  if (!canPrestige()) {
    log("Need at least 5 offers to prestige.");
    return;
  }
  prestigeLevel += 1;
  semester += 1;

  energy = 80;
  maxEnergy = 120;
  energyRegen = 4 + coffeeLevel;
  skill = 20;
  stars = 3;
  offers = 0;
  gpa = 3.2;

  log("You moved up to " + currentTier().name + ", starting a new chapter.");
}

// ---------- Loop & Render ----------
function render() {
  energySpan.textContent = Math.floor(energy);
  maxEnergySpan.textContent = maxEnergy;
  skillSpan.textContent = skill.toFixed(1);
  reputationSpan.textContent = reputation.toFixed(1);
  starsSpan.textContent = Math.floor(stars);
  offersSpan.textContent = offers;
  gpaSpan.textContent = gpa.toFixed(2);
  tickSpan.textContent = tick;

  tierNameSpan.textContent = currentTier().name;
  prestigeLevelSpan.textContent = prestigeLevel;
  semesterSpan.textContent = semester;

  coffeeLevelSpan.textContent = coffeeLevel;
  coffeeCostSpan.textContent = coffeeCost(coffeeLevel).toFixed(1);
  streakLevelSpan.textContent = streakLevel;
  streakCostSpan.textContent = streakCost(streakLevel).toFixed(1);

  btnJoinClub.disabled = energy < 10;
  btnStudy.disabled = energy < 15;
  btnBuildProject.disabled = energy < 25;
  btnApplyResearch.disabled = energy < 30;
  btnApplyInternship.disabled = energy < 40;
  btnPrestige.disabled = !canPrestige();

  tiersList.innerHTML = "";
  tiers.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = (i === prestigeLevel ? "▶ " : "") + t.name + " (x" + t.repBoost + " rep)";
    tiersList.appendChild(li);
  });
}

function gameTick() {
  tick += 1;
  energy = clamp(energy + energyRegen, 0, maxEnergy);
  gainReputation(0.06);
  render();
}

// ---------- Events ----------
btnJoinClub.addEventListener("click", actionJoinClub);
btnStudy.addEventListener("click", actionStudy);
btnBuildProject.addEventListener("click", actionBuildProject);
btnApplyResearch.addEventListener("click", actionApplyResearch);
btnApplyInternship.addEventListener("click", actionApplyInternship);
btnPrestige.addEventListener("click", prestige);

btnCoffee.addEventListener("click", buyCoffee);
btnStreak.addEventListener("click", buyStreak);

// initial
render();
log("You start with some experience: join clubs, study, build projects, then chase research and internships.");

// typical idle 1-second loop [web:8][web:29]
setInterval(gameTick, 1000);
