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

let energy = 50;
let maxEnergy = 100;
let energyRegen = 3; // per tick

let skill = 0;
let reputation = 0;
let stars = 0;
let offers = 0;
let gpa = 3.0;

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

// buttons
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
    log("Too tired for that. Get some rest (wait a bit).");
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

// Join club: small skill/rep gain
function actionJoinClub() {
  const cost = 10;
  if (!spendEnergy(cost)) return;
  gainSkill(1 + prestigeLevel * 0.5);
  gainReputation(0.5);
  log("You joined / helped out with a dev club event.");
}

// Study: bigger skill, slight GPA bump
function actionStudy() {
  const cost = 15;
  if (!spendEnergy(cost)) return;
  gainSkill(3 + prestigeLevel);
  gpa = clamp(gpa + 0.02, 2.0, 4.0);
  log("Grinding algorithms and homework. Skill and GPA improved.");
}

// Build GitHub project: stars, rep, skill
function actionBuildProject() {
  const cost = 25;
  if (!spendEnergy(cost)) return;
  const baseStars = 1 + Math.floor(skill / 20);
  gainStars(baseStars);
  gainSkill(2);
  gainReputation(1.5);
  log("You pushed a new feature to your side project on GitHub.");
}

// Apply for research: chance improves with skill & GPA
function actionApplyResearch() {
  const cost = 30;
  if (!spendEnergy(cost)) return;

  const chance = clamp(0.1 + skill / 100 + (gpa - 3.0) * 0.2, 0.05, 0.9);
  if (tryProbability(chance)) {
    gainSkill(5);
    gainReputation(4);
    gainStars(3);
    log("You joined an undergraduate research project!");
  } else {
    log("Professor never replied to your research email... yet.");
  }
}

// Apply for internship: main “offer” generator
function actionApplyInternship() {
  const cost = 40;
  if (!spendEnergy(cost)) return;

  const baseChance = 0.05 + skill / 150 + stars / 200;
  const tierBonus = prestigeLevel * 0.03;
  const chance = clamp(baseChance + tierBonus, 0.03, 0.85);

  if (tryProbability(chance)) {
    offers += 1;
    gainReputation(6);
    log("You got an internship offer!");
  } else {
    log("Your application was rejected or ghosted.");
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
    log("Not enough reputation to sustain that coffee habit.");
    return;
  }
  reputation -= cost;
  coffeeLevel += 1;
  energyRegen += 1;
  log("Coffee habit upgraded. You regenerate energy faster.");
}

function buyStreak() {
  const cost = streakCost(streakLevel);
  if (reputation < cost) {
    log("Not enough reputation for a serious GitHub streak.");
    return;
  }
  reputation -= cost;
  streakLevel += 1;
  log("Your GitHub streak makes your projects look more impressive.");
}

// ---------- Prestige ----------
function canPrestige() {
  return offers >= 5;
}

function prestige() {
  if (!canPrestige()) {
    log("You need at least 5 offers to prestige to a higher tier.");
    return;
  }
  prestigeLevel += 1;
  semester += 1;

  // soft reset
  energy = 50;
  maxEnergy = 100;
  energyRegen = 3 + coffeeLevel; // upgrades carry over
  skill = 0;
  stars = 0;
  offers = 0;
  gpa = 3.0;

  log("You moved up to " + currentTier().name + ". Everything feels harder, but the payoff is bigger.");
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

  // action button enable/disable based on energy
  btnJoinClub.disabled = energy < 10;
  btnStudy.disabled = energy < 15;
  btnBuildProject.disabled = energy < 25;
  btnApplyResearch.disabled = energy < 30;
  btnApplyInternship.disabled = energy < 40;

  btnPrestige.disabled = !canPrestige();

  // tiers list
  tiersList.innerHTML = "";
  tiers.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = (i === prestigeLevel ? "▶ " : "") + t.name + " (x" + t.repBoost + " rep)";
    tiersList.appendChild(li);
  });
}

function gameTick() {
  tick += 1;

  // regen energy, slightly boosted by coffee
  energy = clamp(energy + energyRegen, 0, maxEnergy);

  // passive reputation from being enrolled at current tier
  gainReputation(0.05);

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
log("Welcome! Start by joining clubs and studying. Build projects, then chase research and internships.");

// 1-second tick, typical idle cadence [web:8][web:29]
setInterval(gameTick, 1000);
