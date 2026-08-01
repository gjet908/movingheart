// ---------- Element references ----------
const plantBtn = document.getElementById("plantBtn");
const waterBtn = document.getElementById("waterBtn");
const replayBtn = document.getElementById("replayBtn");

const seed = document.getElementById("seedSvg");
const soilEllipse = document.getElementById("soilEllipse");
const potSvg = document.querySelector(".pot-svg");

const wateringCan = document.getElementById("wateringCan");
const dropsLayer = document.getElementById("dropsLayer");

const stemPath = document.getElementById("stemPath");
const sprout = document.getElementById("sprout");
const leafLeft = document.getElementById("leafLeft");
const leafRight = document.getElementById("leafRight");
const flowerLeft = document.getElementById("flowerLeft");
const flowerCenter = document.getElementById("flowerCenter");
const flowerRight = document.getElementById("flowerRight");

const message = document.getElementById("message");

let waterInterval = null;

// ---------- Step 1: Plant Seed ----------
plantBtn.addEventListener("click", () => {
  plantBtn.disabled = true;

  seed.classList.add("fall");

  // Seed disappears into the soil after falling
  setTimeout(() => {
    seed.classList.add("hide");
  }, 950);

  // Wait 2 seconds total, then enable Water button
  setTimeout(() => {
    waterBtn.disabled = false;
  }, 2000);
});

// ---------- Step 2: Water Plant ----------
waterBtn.addEventListener("click", () => {
  waterBtn.disabled = true;

  // Bring in the watering can and tilt it to pour
  wateringCan.classList.add("pour");

  // Start spawning water drops shortly after the can tilts
  setTimeout(() => {
    waterInterval = setInterval(createWaterDrop, 160);
  }, 300);

  // Soil becomes darker as watering happens
  soilEllipse.parentElement.parentElement.classList.add("soil-wet");

  // Water animation lasts about 4 seconds, then can leaves
  setTimeout(() => {
    clearInterval(waterInterval);
    wateringCan.classList.remove("pour");
  }, 4000);

  // After watering, wait ~3 seconds, then start growth
  setTimeout(() => {
    growPlant();
  }, 4000 + 3000);
});

// Creates a single falling SVG water drop
function createWaterDrop() {
  const xOffset = Math.random() * 26 - 13;
  const startX = 150 + xOffset;

  const drop = document.createElementNS("http://www.w3.org/2000/svg", "path");
  drop.setAttribute(
    "d",
    "M0 0 C 3 5, 4 9, 0 12 C -4 9, -3 5, 0 0 Z"
  );
  drop.setAttribute("class", "water-drop");
  drop.setAttribute("transform", `translate(${startX}, 20)`);
  dropsLayer.appendChild(drop);

  const duration = 700;
  const start = performance.now();

  function animateDrop(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const y = 20 + t * 200;
    const opacity = 1 - t * 0.6;
    drop.setAttribute("transform", `translate(${startX}, ${y})`);
    drop.style.opacity = opacity;

    if (t < 1) {
      requestAnimationFrame(animateDrop);
    } else {
      drop.remove();
    }
  }

  requestAnimationFrame(animateDrop);
}

// ---------- Step 3: Grow Plant ----------
function growPlant() {
  // Small sprout appears first
  sprout.classList.add("show");

  setTimeout(() => {
    sprout.classList.add("fade");
    // Stem starts growing slowly
    stemPath.classList.add("grow");
  }, 700);

  // Leaves appear while stem is still growing
  setTimeout(() => {
    leafLeft.classList.add("show");
  }, 1900);

  setTimeout(() => {
    leafRight.classList.add("show");
  }, 2500);

  // Flowers bloom one by one after the stem has fully grown
  setTimeout(() => {
    flowerLeft.classList.add("bloom");
  }, 4200);

  setTimeout(() => {
    flowerCenter.classList.add("bloom");
  }, 5200);

  setTimeout(() => {
    flowerRight.classList.add("bloom");
  }, 6200);

  // Show final success message
  setTimeout(() => {
    message.classList.remove("hidden");
  }, 7200);
}

// ---------- Replay ----------
replayBtn.addEventListener("click", () => {
  resetScene();
});

function resetScene() {
  // Reset seed
  seed.classList.remove("fall", "hide");

  // Reset soil
  soilEllipse.parentElement.parentElement.classList.remove("soil-wet");

  // Reset watering can
  wateringCan.classList.remove("pour");

  // Reset sprout
  sprout.classList.remove("show", "fade");

  // Reset stem
  stemPath.classList.remove("grow");

  // Reset leaves
  leafLeft.classList.remove("show");
  leafRight.classList.remove("show");

  // Reset flowers
  flowerLeft.classList.remove("bloom");
  flowerCenter.classList.remove("bloom");
  flowerRight.classList.remove("bloom");

  // Reset buttons
  plantBtn.disabled = false;
  waterBtn.disabled = true;

  // Hide message
  message.classList.add("hidden");

  // Clear any leftover water interval and drops
  if (waterInterval) {
    clearInterval(waterInterval);
    waterInterval = null;
  }
  dropsLayer.innerHTML = "";
}
