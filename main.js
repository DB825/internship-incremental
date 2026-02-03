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

// Start decent but not overpowered
let energy = 60;
let maxEnergy = 100;
let energyRegen = 5; // per tick

let skill = 10;
let reputation = 2;
let stars = 0;
let offers = 0;
let gpa = 3.0;

// upgrades
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

function spendEnergy(cost) {
  if (energy < cost) {
    log("Too tired. Wait a few seconds to recover energy.");
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
  const cost = 10;
  if (!spendEnergy(cost)) return;
  playClick();
  gainSkill(3 + prestigeLevel);
  gainReputation(0.8);
  log("You joined / helped with a club event. Small skill and rep boost.");
}

function actionStudy() {
  const cost = 15;
  if (!spendEnergy(cost)) return;
  playClick();
  gainSkill(6 + prestigeLevel * 2);
  gpa = clamp(gpa + 0.05, 2.0, 4.0);
  log("You studied hard. Skill and GPA went up.");
}

function actionBuildProject() {
  const cost = 25;
  if (!spendEnergy(cost)) return;
  playClick();
  const baseStars = 1 + Math.floor(skill / 15);
  gainStars(baseStars);
  gainSkill(4);
  gainReputation(2);
  log("You shipped a GitHub project. Stars and rep increased.");
}

function actionApplyResearch() {
  const cost = 30;
  if (!spendEnergy(cost)) return;
  playClick();

  const chance = clamp(0.25 + skill / 120 + (gpa - 3.0) * 0.3, 0.15, 0.95);
  if (tryProbability(chance)) {
    gainSkill(10);
    gainReputation(6);
    gainStars(4);
    log("You joined a research project! Big boost to skill, rep, and stars.");
  } else {
    log("Professors didn’t respond this time.");
  }
}

function actionApplyInternship() {
  const cost = 40;
  if (!spendEnergy(cost)) return;
  playClick();

  const baseChance = 0.15 + skill / 180 + stars / 200;
  const tierBonus = prestigeLevel * 0.05;
  const chance = clamp(baseChance + tierBonus, 0.10, 0.9);

  if (tryProbability(chance)) {
    offers += 1;
    gainReputation(8);
    playOffer();
    log("You got an internship offer!");
  } else {
    log("That internship application didn’t land. Try again after more skill/stars.");
  }
}

// ---------- Upgrades ----------
function coffeeCost(level) {
  return 8 * Math.pow(1.5, level);
}

function streakCost(level) {
  return 15 * Math.pow(1.6, level);
}

function buyCoffee() {
  const cost = coffeeCost(coffeeLevel);
  if (reputation < cost) {
    log("Not enough reputation for a bigger coffee habit.");
    return;
  }
  reputation -= cost;
  coffeeLevel += 1;
  energyRegen += 1.5;
  playClick();
  log("Coffee habit upgraded. Energy regen increased.");
}

function buyStreak() {
  const cost = streakCost(streakLevel);
  if (reputation < cost) {
    log("Not enough reputation to maintain that GitHub streak.");
    return;
  }
  reputation -= cost;
  streakLevel += 1;
  playClick();
  log("GitHub streak improved. Stars and rep generation are stronger.");
}

// ---------- Prestige ----------
function canPrestige() {
  return offers >= 5;
}

function prestige() {
  if (!canPrestige()) {
    log("Get at least 5 offers before prestiging to a higher tier.");
    return;
  }
  playClick();
  prestigeLevel += 1;
  semester += 1;

  energy = 60;
  maxEnergy = 110 + prestigeLevel * 10;
  energyRegen = 5 + coffeeLevel;
  skill = 12 + prestigeLevel * 3;
  stars = 0;
  offers = 0;
  gpa = 3.0;

  log("You moved up to " + currentTier().name + ". New semester, better baseline, higher expectations.");
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
  gainReputation(0.08);
  if (skill > 0) {
    gainStars(0.02 + skill / 500);
  }
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
log("Join clubs, study, and build projects to raise skill/stars, then apply for research and internships.");

// 1-second idle loop [web:18][web:2]
setInterval(gameTick, 1000);
