const svgNS = "http://www.w3.org/2000/svg";
const xlinkNS = "http://www.w3.org/1999/xlink";

// ---------- Basic element references ----------
const plantBtn = document.getElementById("plantBtn");
const waterBtn = document.getElementById("waterBtn");
const replayBtn = document.getElementById("replayBtn");
const stageLabel = document.getElementById("stageLabel");

const seed = document.getElementById("seedSvg");
const soilGroupParent = document.getElementById("soilEllipse").parentElement.parentElement;
const wateringCan = document.getElementById("wateringCan");
const dropsLayer = document.getElementById("dropsLayer");

const stemMain = document.getElementById("stemMain");
const stemBranchL = document.getElementById("stemBranchL");
const stemBranchR = document.getElementById("stemBranchR");
const sprout = document.getElementById("sprout");
const leavesLayer = document.getElementById("leavesLayer");

const flowerMainG = document.getElementById("flowerMain");
const flowerLeftG = document.getElementById("flowerLeft");
const flowerRightG = document.getElementById("flowerRight");

const message = document.getElementById("message");

let waterInterval = null;

// ---------- Easing ----------
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ---------- Generic scale animation (pivots at the element's own local origin) ----------
function animateScale(el, toScale, duration, opts = {}) {
  const baseTransform = opts.baseTransform || "";
  const fromScale = opts.fromScale !== undefined ? opts.fromScale : 0.05;
  const easing = opts.easing || easeOutBack;
  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const e = easing(t);
    const s = fromScale + (toScale - fromScale) * e;
    el.setAttribute("transform", `${baseTransform} scale(${s})`.trim());
    if (t < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

function showPart(el, toScale, duration, fromScale) {
  el.classList.remove("fadeout");
  el.classList.add("show");
  animateScale(el, toScale, duration, { fromScale: fromScale !== undefined ? fromScale : 0.05 });
}

function resetPart(el, baseTransform) {
  el.classList.remove("show", "fadeout");
  el.setAttribute("transform", `${baseTransform || ""} scale(0.05)`.trim());
}

// ---------- Petal path builder ----------
function petalPath(len, width) {
  return `M0,0 C ${-width},${-len * 0.35} ${-width * 0.55},${-len * 0.82} 0,${-len} ` +
         `C ${width * 0.55},${-len * 0.82} ${width},${-len * 0.35} 0,0 Z`;
}

function buildRing(parentG, className, count, len, width, gradId, angleOffset) {
  const g = document.createElementNS(svgNS, "g");
  g.setAttribute("class", className);
  for (let i = 0; i < count; i++) {
    const jitter = Math.sin(i * 2.1) * 3;
    const angle = angleOffset + i * (360 / count) + jitter;
    const lenVar = len * (0.92 + (i % 3) * 0.05);
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", petalPath(lenVar, width));
    p.setAttribute("fill", `url(#${gradId})`);
    p.setAttribute("transform", `rotate(${angle})`);
    g.appendChild(p);
  }
  parentG.appendChild(g);
  g.setAttribute("transform", "scale(0.05)");
  return g;
}

function buildSepals(parentG) {
  const g = document.createElementNS(svgNS, "g");
  g.setAttribute("class", "sepals");
  const count = 5;
  for (let i = 0; i < count; i++) {
    const angle = i * (360 / count) + 10;
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", petalPath(15, 5.5));
    p.setAttribute("fill", "url(#sepalGrad)");
    p.setAttribute("transform", `rotate(${angle})`);
    g.appendChild(p);
  }
  parentG.appendChild(g);
  g.setAttribute("transform", "scale(0.05)");
  return g;
}

function buildBudcap(parentG) {
  const g = document.createElementNS(svgNS, "g");
  g.setAttribute("class", "budcap");
  const p = document.createElementNS(svgNS, "path");
  p.setAttribute("d", "M-6,0 C -9,-18 -6,-34 0,-40 C 6,-34 9,-18 6,0 Z");
  p.setAttribute("fill", "url(#budGrad)");
  g.appendChild(p);
  parentG.appendChild(g);
  g.setAttribute("transform", "scale(0.05)");
  return g;
}

function buildCenter(parentG) {
  const g = document.createElementNS(svgNS, "g");
  g.setAttribute("class", "center");
  const count = 34;
  for (let i = 0; i < count; i++) {
    const angle = i * 137.508 * (Math.PI / 180);
    const r = 1.15 * Math.sqrt(i);
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    const c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", x.toFixed(2));
    c.setAttribute("cy", y.toFixed(2));
    c.setAttribute("r", 1.3);
    c.setAttribute("fill", "url(#centerGrad)");
    g.appendChild(c);
  }
  parentG.appendChild(g);
  g.setAttribute("transform", "scale(0.05)");
  return g;
}

// Builds the full internal structure of a flower inside an (already
// positioned) container <g> and returns references to each animatable part.
function buildFlower(containerG) {
  containerG.innerHTML = "";
  const sepals = buildSepals(containerG);
  const ring1 = buildRing(containerG, "ring1", 10, 34, 9, "petalGradOuter", 0);
  const ring2 = buildRing(containerG, "ring2", 9, 25, 7, "petalGradMid", 20);
  const ring3 = buildRing(containerG, "ring3", 7, 16, 5, "petalGradInner", 10);
  const center = buildCenter(containerG);
  const budcap = buildBudcap(containerG);
  return { sepals, ring1, ring2, ring3, center, budcap };
}

// ---------- Flower stage transitions ----------
function flowerBud(refs) {
  showPart(refs.sepals, 1, 900, 0.3);
  showPart(refs.budcap, 1, 1100, 0.2);
}

function flowerBloom(refs) {
  refs.budcap.classList.add("fadeout");
  showPart(refs.ring1, 0.8, 1400);
  showPart(refs.ring2, 0.75, 1500);
}

function flowerFull(refs) {
  animateScale(refs.ring1, 1, 1200, { fromScale: 0.8, easing: easeOutCubic });
  animateScale(refs.ring2, 1, 1200, { fromScale: 0.75, easing: easeOutCubic });
  showPart(refs.ring3, 1, 1300);
  showPart(refs.center, 1, 1000);
}

function resetFlower(refs) {
  resetPart(refs.sepals);
  resetPart(refs.ring1);
  resetPart(refs.ring2);
  resetPart(refs.ring3);
  resetPart(refs.center);
  resetPart(refs.budcap);
}

// ---------- Leaves ----------
const leafPlacements = {
  p1L: { x: 150, y: 300, angle: -38, scale: 0.95, grad: "A" },
  p1R: { x: 150, y: 294, angle: 38, scale: 1.0, grad: "B" },
  p2L: { x: 150, y: 228, angle: -42, scale: 1.05, grad: "B" },
  p2R: { x: 150, y: 222, angle: 40, scale: 1.0, grad: "A" },
  p3L: { x: 150, y: 148, angle: -32, scale: 0.8, grad: "A" },
  p3R: { x: 150, y: 143, angle: 34, scale: 0.8, grad: "B" },
  branchL: { x: 150, y: 236, angle: -75, scale: 0.6, grad: "A" },
  branchR: { x: 149, y: 166, angle: 68, scale: 0.6, grad: "B" }
};

const leafElements = {};

function createLeafElements() {
  Object.keys(leafPlacements).forEach((key) => {
    const p = leafPlacements[key];
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "leaf-item");
    const use = document.createElementNS(svgNS, "use");
    use.setAttributeNS(xlinkNS, "href", "#leafShape");
    use.setAttribute("href", "#leafShape");
    use.setAttribute("fill", p.grad === "A" ? "url(#leafGradA)" : "url(#leafGradB)");
    g.appendChild(use);
    leavesLayer.appendChild(g);

    const baseTransform = `translate(${p.x},${p.y}) rotate(${p.angle})`;
    g.setAttribute("transform", `${baseTransform} scale(0.05)`);
    leafElements[key] = { el: g, baseTransform, finalScale: p.scale };
  });
}

function showLeaf(key) {
  const item = leafElements[key];
  item.el.classList.add("show");
  animateScale(item.el, item.finalScale, 1000, { baseTransform: item.baseTransform, fromScale: 0.05 });
}

function resetLeaves() {
  Object.keys(leafElements).forEach((key) => {
    const item = leafElements[key];
    item.el.classList.remove("show");
    item.el.setAttribute("transform", `${item.baseTransform} scale(0.05)`);
  });
}

// ---------- Build everything once on load ----------
flowerMainG.setAttribute("transform", "translate(149,63)");
flowerLeftG.setAttribute("transform", "translate(74,148) rotate(-18) scale(0.82)");
flowerRightG.setAttribute("transform", "translate(197,88) rotate(16) scale(0.82)");

const mainRefs = buildFlower(flowerMainG);
const leftRefs = buildFlower(flowerLeftG);
const rightRefs = buildFlower(flowerRightG);

createLeafElements();

// ---------- Step 1: Plant Seed ----------
plantBtn.addEventListener("click", () => {
  plantBtn.disabled = true;
  setStage("Seed");

  seed.classList.add("fall");

  setTimeout(() => {
    seed.classList.add("hide");
  }, 950);

  setTimeout(() => {
    waterBtn.disabled = false;
  }, 2000);
});

// ---------- Step 2: Water Plant ----------
waterBtn.addEventListener("click", () => {
  waterBtn.disabled = true;

  wateringCan.classList.add("pour");

  setTimeout(() => {
    waterInterval = setInterval(createWaterDrop, 160);
  }, 300);

  soilGroupParent.classList.add("soil-wet");

  setTimeout(() => {
    clearInterval(waterInterval);
    wateringCan.classList.remove("pour");
  }, 4000);

  setTimeout(() => {
    growPlant();
  }, 4000 + 3000);
});

function createWaterDrop() {
  const xOffset = Math.random() * 26 - 13;
  const startX = 150 + xOffset;

  const drop = document.createElementNS(svgNS, "path");
  drop.setAttribute("d", "M0 0 C 3 5, 4 9, 0 12 C -4 9, -3 5, 0 0 Z");
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

// ---------- Stage label ----------
function setStage(text) {
  stageLabel.textContent = text;
}

// ---------- Step 3: Full growth sequence (~33 seconds, matching a
// Seed -> Sprout -> Small Plant -> Bud -> Bloom -> Full Bloom cycle) ----------
function growPlant() {
  setStage("Sprout");
  sprout.classList.add("show");

  setTimeout(() => {
    sprout.classList.add("fade");
    stemMain.classList.add("grow");
    setStage("Small Plant");
  }, 1200);

  setTimeout(() => {
    showLeaf("p1L");
    showLeaf("p1R");
  }, 3200);

  setTimeout(() => {
    setStage("Bud");
    showLeaf("p2L");
    showLeaf("p2R");
  }, 7000);

  setTimeout(() => {
    flowerBud(mainRefs);
  }, 8200);

  setTimeout(() => {
    stemBranchL.classList.add("grow");
    showLeaf("branchL");
  }, 10000);

  setTimeout(() => {
    setStage("Blooming");
    flowerBloom(mainRefs);
  }, 13500);

  setTimeout(() => {
    flowerBud(leftRefs);
  }, 14500);

  setTimeout(() => {
    showLeaf("p3L");
    showLeaf("p3R");
  }, 16000);

  setTimeout(() => {
    stemBranchR.classList.add("grow");
    showLeaf("branchR");
  }, 17000);

  setTimeout(() => {
    setStage("Full Bloom");
    flowerFull(mainRefs);
  }, 19500);

  setTimeout(() => {
    flowerBloom(leftRefs);
  }, 20500);

  setTimeout(() => {
    flowerBud(rightRefs);
  }, 22000);

  setTimeout(() => {
    flowerFull(leftRefs);
  }, 24500);

  setTimeout(() => {
    flowerBloom(rightRefs);
  }, 26000);

  setTimeout(() => {
    flowerFull(rightRefs);
  }, 30500);

  setTimeout(() => {
    message.classList.remove("hidden");
  }, 33500);
}

// ---------- Replay ----------
replayBtn.addEventListener("click", () => {
  resetScene();
});

function resetScene() {
  seed.classList.remove("fall", "hide");
  soilGroupParent.classList.remove("soil-wet");
  wateringCan.classList.remove("pour");

  sprout.classList.remove("show", "fade");

  stemMain.classList.remove("grow");
  stemBranchL.classList.remove("grow");
  stemBranchR.classList.remove("grow");

  resetLeaves();

  resetFlower(mainRefs);
  resetFlower(leftRefs);
  resetFlower(rightRefs);

  plantBtn.disabled = false;
  waterBtn.disabled = true;

  message.classList.add("hidden");
  setStage("Seed");

  if (waterInterval) {
    clearInterval(waterInterval);
    waterInterval = null;
  }
  dropsLayer.innerHTML = "";
}
