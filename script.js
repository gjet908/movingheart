
// ---------- Element references ----------
const plantBtn = document.getElementById("plantBtn");
const waterBtn = document.getElementById("waterBtn");
const replayBtn = document.getElementById("replayBtn");

const seed = document.getElementById("seed");
const soil = document.getElementById("soil");
const potWrap = document.querySelector(".pot-wrap");

const stem = document.getElementById("stem");
const leafLeft = document.getElementById("leafLeft");
const leafRight = document.getElementById("leafRight");
const flower1 = document.getElementById("flower1");
const flower2 = document.getElementById("flower2");
const flower3 = document.getElementById("flower3");

const message = document.getElementById("message");

let waterInterval = null;

// ---------- Step 1: Plant Seed ----------
plantBtn.addEventListener("click", () => {
  plantBtn.disabled = true;

  // Trigger seed falling animation
  seed.classList.add("fall");

  // Seed disappears into the soil after falling
  setTimeout(() => {
    seed.classList.add("hide");
  }, 1000);

  // Wait 2 seconds total, then enable Water button
  setTimeout(() => {
    waterBtn.disabled = false;
  }, 2000);
});

// ---------- Step 2: Water Plant ----------
waterBtn.addEventListener("click", () => {
  waterBtn.disabled = true;

  // Start spawning water drops
  waterInterval = setInterval(createWaterDrop, 150);

  // Soil becomes darker as watering happens
  soil.classList.add("wet");

  // Water animation lasts about 4 seconds
  setTimeout(() => {
    clearInterval(waterInterval);
  }, 4000);

  // After watering, wait ~3 seconds, then start growth
  setTimeout(() => {
    growPlant();
  }, 4000 + 3000);
});

// Creates a single falling water drop element
function createWaterDrop() {
  const drop = document.createElement("div");
  drop.classList.add("water-drop");
  drop.style.marginLeft = (Math.random() * 30 - 15) + "px";
  potWrap.appendChild(drop);

  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}

// ---------- Step 3: Grow Plant ----------
function growPlant() {
  // Stem starts growing slowly
  stem.classList.add("grow");

  // Leaves appear while stem is still growing
  setTimeout(() => {
    leafLeft.classList.add("show");
  }, 1200);

  setTimeout(() => {
    leafRight.classList.add("show");
  }, 1800);

  // Flowers bloom one by one after the stem has fully grown
  setTimeout(() => {
    flower1.classList.add("bloom");
  }, 3600);

  setTimeout(() => {
    flower2.classList.add("bloom");
  }, 4600);

  setTimeout(() => {
    flower3.classList.add("bloom");
  }, 5600);

  // Show final success message
  setTimeout(() => {
    message.classList.remove("hidden");
  }, 6600);
}

// ---------- Replay ----------
replayBtn.addEventListener("click", () => {
  resetScene();
});

function resetScene() {
  // Reset seed
  seed.classList.remove("fall", "hide");

  // Reset soil
  soil.classList.remove("wet");

  // Reset stem
  stem.classList.remove("grow");

  // Reset leaves
  leafLeft.classList.remove("show");
  leafRight.classList.remove("show");

  // Reset flowers
  flower1.classList.remove("bloom");
  flower2.classList.remove("bloom");
  flower3.classList.remove("bloom");

  // Reset buttons
  plantBtn.disabled = false;
  waterBtn.disabled = true;

  // Hide message
  message.classList.add("hidden");

  // Clear any leftover water interval
  if (waterInterval) {
    clearInterval(waterInterval);
    waterInterval = null;
  }

  // Remove any leftover water drop elements
  document.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
}
