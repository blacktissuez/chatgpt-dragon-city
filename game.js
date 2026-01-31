const state = {
  coins: 500,
  food: 120,
  gems: 12,
  dragons: [
    createDragon("Emberling", "Fire", 1),
    createDragon("Aqualume", "Water", 1),
  ],
  habitats: [
    createHabitat("Flame Reef", "Fire", 2),
    createHabitat("Misty Lake", "Water", 2),
  ],
  eggs: [],
  breeding: null,
};

const quests = [
  { label: "Collect 150 coins", progress: 0, goal: 150 },
  { label: "Feed dragons 3 times", progress: 0, goal: 3 },
  { label: "Hatch one egg", progress: 0, goal: 1 },
];

const elements = {
  coins: document.getElementById("coins"),
  food: document.getElementById("food"),
  gems: document.getElementById("gems"),
  hatchery: document.getElementById("hatchery"),
  habitats: document.getElementById("habitats"),
  academy: document.getElementById("academy"),
  breeding: document.getElementById("breeding"),
  quests: document.getElementById("quests"),
  toast: document.getElementById("toast"),
  buyEgg: document.getElementById("buy-egg"),
  collectAll: document.getElementById("collect-all"),
  buyFood: document.getElementById("buy-food"),
  breedButton: document.getElementById("breed-button"),
};

function createDragon(name, element, level) {
  return {
    id: crypto.randomUUID(),
    name,
    element,
    level,
    happiness: 80,
  };
}

function createHabitat(name, element, capacity) {
  return {
    id: crypto.randomUUID(),
    name,
    element,
    capacity,
    dragons: [],
    storedCoins: 0,
  };
}

function createEgg() {
  return {
    id: crypto.randomUUID(),
    element: randomElement(),
    progress: 0,
    duration: 100,
  };
}

function randomElement() {
  const options = ["Fire", "Water", "Nature", "Electric", "Earth"];
  return options[Math.floor(Math.random() * options.length)];
}

function updateResources() {
  elements.coins.textContent = state.coins;
  elements.food.textContent = state.food;
  elements.gems.textContent = state.gems;
}

function renderHatchery() {
  elements.hatchery.innerHTML = "";
  if (state.eggs.length === 0) {
    elements.hatchery.innerHTML =
      "<p class=\"card\">No eggs incubating. Buy an egg to start hatching!</p>";
    return;
  }

  state.eggs.forEach((egg) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("p");
    title.className = "card__title";
    title.textContent = `${egg.element} Egg`;

    const progress = document.createElement("div");
    progress.className = "progress";
    const bar = document.createElement("span");
    bar.style.width = `${egg.progress}%`;
    progress.appendChild(bar);

    const meta = document.createElement("div");
    meta.className = "card__meta";
    meta.innerHTML = `<span>Hatching</span><span>${egg.progress}%</span>`;

    const hatchButton = document.createElement("button");
    hatchButton.className = "secondary";
    hatchButton.textContent = "Instant Hatch (3 💎)";
    hatchButton.addEventListener("click", () => instantHatch(egg.id));

    card.append(title, meta, progress, hatchButton);
    elements.hatchery.appendChild(card);
  });
}

function renderHabitats() {
  elements.habitats.innerHTML = "";
  state.habitats.forEach((habitat) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.innerHTML = `
      <p class="card__title">${habitat.name}</p>
      <div class="badge">${habitat.element}</div>
    `;

    const dragonList = document.createElement("div");
    dragonList.className = "card__meta";
    dragonList.textContent =
      habitat.dragons.length === 0
        ? "No dragons assigned"
        : habitat.dragons.map((dragon) => dragon.name).join(", ");

    const coinStatus = document.createElement("div");
    coinStatus.className = "card__meta";
    coinStatus.innerHTML = `<span>Stored</span><span>${habitat.storedCoins} 🪙</span>`;

    const actions = document.createElement("div");
    actions.className = "card__actions";

    const assignButton = document.createElement("button");
    assignButton.className = "secondary";
    assignButton.textContent = "Assign Dragon";
    assignButton.addEventListener("click", () => assignDragon(habitat.id));

    const collectButton = document.createElement("button");
    collectButton.className = "primary";
    collectButton.textContent = "Collect";
    collectButton.addEventListener("click", () => collectCoins(habitat.id));

    actions.append(assignButton, collectButton);
    card.append(header, dragonList, coinStatus, actions);
    elements.habitats.appendChild(card);
  });
}

function renderAcademy() {
  elements.academy.innerHTML = "";
  state.dragons.forEach((dragon) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("p");
    title.className = "card__title";
    title.textContent = `${dragon.name} (Lv ${dragon.level})`;

    const meta = document.createElement("div");
    meta.className = "card__meta";
    meta.innerHTML = `<span>${dragon.element}</span><span>Happiness ${dragon.happiness}%</span>`;

    const actions = document.createElement("div");
    actions.className = "card__actions";

    const feedButton = document.createElement("button");
    feedButton.className = "secondary";
    feedButton.textContent = "Feed (20 🌿)";
    feedButton.addEventListener("click", () => feedDragon(dragon.id));

    actions.append(feedButton);
    card.append(title, meta, actions);
    elements.academy.appendChild(card);
  });
}

function renderBreeding() {
  elements.breeding.innerHTML = "";
  const card = document.createElement("div");
  card.className = "card";

  if (!state.breeding) {
    card.innerHTML =
      "<p class=\"card__title\">Select two dragons to breed a hybrid.</p>";
  } else {
    const { parentA, parentB, progress } = state.breeding;
    card.innerHTML = `
      <p class="card__title">Breeding ${parentA.name} + ${parentB.name}</p>
      <div class="card__meta"><span>Incubating hybrid egg</span><span>${progress}%</span></div>
      <div class="progress"><span style="width: ${progress}%;"></span></div>
    `;
  }

  elements.breeding.appendChild(card);
}

function renderQuests() {
  elements.quests.innerHTML = "";
  quests.forEach((quest) => {
    const item = document.createElement("li");
    const completed = quest.progress >= quest.goal;
    item.textContent = `${quest.label} (${Math.min(quest.progress, quest.goal)}/${quest.goal})`;
    if (completed) {
      item.style.color = "var(--success)";
      item.style.fontWeight = "700";
    }
    elements.quests.appendChild(item);
  });
}

function assignDragon(habitatId) {
  const habitat = state.habitats.find((item) => item.id === habitatId);
  const available = state.dragons.filter(
    (dragon) => !state.habitats.some((hab) => hab.dragons.includes(dragon))
  );

  if (available.length === 0) {
    showToast("All dragons are already assigned.");
    return;
  }

  if (habitat.dragons.length >= habitat.capacity) {
    showToast("Habitat is full. Upgrade needed!");
    return;
  }

  habitat.dragons.push(available[0]);
  showToast(`${available[0].name} moved to ${habitat.name}.`);
  renderHabitats();
}

function collectCoins(habitatId) {
  const habitat = state.habitats.find((item) => item.id === habitatId);
  if (habitat.storedCoins === 0) {
    showToast("No coins stored yet.");
    return;
  }

  state.coins += habitat.storedCoins;
  quests[0].progress += habitat.storedCoins;
  habitat.storedCoins = 0;
  updateResources();
  renderHabitats();
  renderQuests();
  showToast("Coins collected!");
}

function collectAll() {
  state.habitats.forEach((habitat) => {
    if (habitat.storedCoins > 0) {
      state.coins += habitat.storedCoins;
      quests[0].progress += habitat.storedCoins;
      habitat.storedCoins = 0;
    }
  });
  updateResources();
  renderHabitats();
  renderQuests();
  showToast("All available coins collected.");
}

function buyEgg() {
  if (state.coins < 200) {
    showToast("Not enough coins for an egg.");
    return;
  }

  state.coins -= 200;
  const egg = createEgg();
  state.eggs.push(egg);
  updateResources();
  renderHatchery();
  showToast("New egg added to the hatchery!");
}

function instantHatch(eggId) {
  const eggIndex = state.eggs.findIndex((egg) => egg.id === eggId);
  if (eggIndex === -1) return;

  if (state.gems < 3) {
    showToast("Need 3 gems to instant hatch.");
    return;
  }

  state.gems -= 3;
  hatchEgg(state.eggs[eggIndex]);
  state.eggs.splice(eggIndex, 1);
  updateResources();
  renderHatchery();
}

function hatchEgg(egg) {
  const newDragon = createDragon(
    `${egg.element}ling`,
    egg.element,
    Math.floor(Math.random() * 2) + 1
  );
  state.dragons.push(newDragon);
  quests[2].progress += 1;
  renderAcademy();
  renderQuests();
  showToast(`${newDragon.name} hatched!`);
}

function feedDragon(dragonId) {
  const dragon = state.dragons.find((item) => item.id === dragonId);
  if (!dragon) return;

  if (state.food < 20) {
    showToast("Grow more food to feed dragons.");
    return;
  }

  state.food -= 20;
  dragon.level += 1;
  dragon.happiness = Math.min(100, dragon.happiness + 10);
  quests[1].progress += 1;
  updateResources();
  renderAcademy();
  renderQuests();
  showToast(`${dragon.name} reached level ${dragon.level}!`);
}

function growFood() {
  if (state.coins < 50) {
    showToast("Not enough coins to grow food.");
    return;
  }

  state.coins -= 50;
  state.food += 40;
  updateResources();
  showToast("Food harvest ready!");
}

function startBreeding() {
  if (state.breeding) {
    showToast("Breeding already in progress.");
    return;
  }

  if (state.dragons.length < 2) {
    showToast("You need at least two dragons to breed.");
    return;
  }

  const [parentA, parentB] = state.dragons.slice(0, 2);
  state.breeding = { parentA, parentB, progress: 0 };
  renderBreeding();
  showToast("Breeding started in the cave.");
}

function processHatching() {
  state.eggs.forEach((egg) => {
    egg.progress += 5;
  });

  const ready = state.eggs.filter((egg) => egg.progress >= egg.duration);
  ready.forEach((egg) => {
    hatchEgg(egg);
  });

  state.eggs = state.eggs.filter((egg) => egg.progress < egg.duration);
  if (ready.length > 0) {
    renderHatchery();
  }
}

function processHabitats() {
  state.habitats.forEach((habitat) => {
    if (habitat.dragons.length === 0) return;
    const output = habitat.dragons.reduce((sum, dragon) => sum + 4 + dragon.level, 0);
    habitat.storedCoins = Math.min(200, habitat.storedCoins + output);
  });
  renderHabitats();
}

function processBreeding() {
  if (!state.breeding) return;
  state.breeding.progress += 8;
  if (state.breeding.progress >= 100) {
    const hybridElement = `${state.breeding.parentA.element}-${state.breeding.parentB.element}`;
    const egg = createEgg();
    egg.element = hybridElement;
    state.eggs.push(egg);
    state.breeding = null;
    showToast("Hybrid egg created! Check the hatchery.");
    renderHatchery();
  }
  renderBreeding();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2000);
}

function init() {
  updateResources();
  renderHatchery();
  renderHabitats();
  renderAcademy();
  renderBreeding();
  renderQuests();

  elements.buyEgg.addEventListener("click", buyEgg);
  elements.collectAll.addEventListener("click", collectAll);
  elements.buyFood.addEventListener("click", growFood);
  elements.breedButton.addEventListener("click", startBreeding);

  setInterval(processHatching, 1200);
  setInterval(processHabitats, 2000);
  setInterval(processBreeding, 1500);
}

init();
