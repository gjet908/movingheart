/* =========================================================================
   GROWING PLANT ANIMATION
   All SVG artwork (pot, watering can, stems, leaves, flowers) is authored
   inline in index.html / generated procedurally right here in JS.
   This file is organised into clearly commented sections:

     1. Element references
     2. Easing + generic animation helpers
     3. SVG artwork builders (petals, leaves, flowers)
     4. Flower stage transitions
     5. Leaf placement + reveal
     6. Water drop + splash effects
     7. Event handlers: Plant Seed -> Water Plant -> Growth -> Message
     8. Replay / reset
   ========================================================================= */

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

/* =========================================================================
   1. ELEMENT REFERENCES
   ========================================================================= */
const plantBtn = document.getElementById("plantBtn");
const waterBtn = document.getElementById("waterBtn");
const replayBtn = document.getElementById("replayBtn");
const stageLabel = document.getElementById("stageLabel");

const seedEl = document.getElementById("seedSvg");
const soilEllipse = document.getElementById("soilEllipse");
const soilGroupParent = soilEllipse.parentElement.parentElement; // .pot-svg
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

/* =========================================================================
   2. EASING + GENERIC ANIMATION HELPERS
   ========================================================================= */

/**
 * Cubic ease-out — smooth deceleration, used for opening/growing motion.
 */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * "Back" ease-out — slight overshoot, used for a satisfying petal "pop".
 */
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Animates an element's scale by directly writing the SVG `transform`
 * attribute each frame. Using the raw transform attribute (rather than a
 * CSS transform) guarantees the scale pivots around the element's own
 * local (0,0) origin — which is exactly where every petal / leaf in this
 * project is anchored — so groups always grow outward from the correct
 * point regardless of where they sit in the illustration.
 *
 * @param {SVGElement} el            Element to animate.
 * @param {number}     toScale       Target scale factor.
 * @param {number}     duration      Duration in milliseconds.
 * @param {object}     [opts]
 * @param {string}     [opts.baseTransform] A fixed transform (translate/rotate)
 *                                          applied before the scale.
 * @param {number}     [opts.fromScale=0.05] Starting scale factor.
 * @param {function}   [opts.easing]  Easing function, defaults to easeOutBack.
 */
function animateScale(el, toScale, duration, opts = {}) {
  const baseTransform = opts.baseTransform || "";
  const fromScale = opts.fromScale !== undefined ? opts.fromScale : 0.05;
  const easing = opts.easing || easeOutBack;
  const start = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = easing(t);
    const s = fromScale + (toScale - fromScale) * eased;
    el.setAttribute("transform", `${baseTransform} scale(${s})`.trim());
    if (t < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

/**
 * Fades an element in (via CSS class) while simultaneously scaling it up.
 */
function showPart(el, toScale, duration, fromScale) {
  el.classList.remove("fadeout");
  el.classList.add("show");
  animateScale(el, toScale, duration, { fromScale: fromScale !== undefined ? fromScale : 0.05 });
}

/**
 * Resets a part back to its hidden, unscaled starting state.
 */
function resetPart(el, baseTransform) {
  el.classList.remove("show", "fadeout");
  el.setAttribute("transform", `${baseTransform || ""} scale(0.05)`.trim());
}

/* =========================================================================
   3. SVG ARTWORK BUILDERS (petals, leaves, flowers)
   All artwork here is generated with plain SVG path / circle primitives —
   no external assets, no canvas, no libraries.
   ========================================================================= */

/**
 * Builds a single teardrop-shaped petal path, tip pointing "up" (-y),
 * base anchored at the local origin (0,0).
 */
function petalPath(len, width) {
  return (
    `M0,0 C ${-width},${-len * 0.35} ${-width * 0.55},${-len * 0.82} 0,${-len} ` +
    `C ${width * 0.55},${-len * 0.82} ${width},${-len * 0.35} 0,0 Z`
  );
}

/**
 * Builds one ring of evenly-spaced petals around the local origin.
 * Multiple rings (outer / mid / inner) are layered to build a full,
 * realistic multi-petal bloom.
 */
function buildRing(parentG, className, count, len, width, gradId, angleOffset) {
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", className);

  for (let i = 0; i < count; i++) {
    const jitter = Math.sin(i * 2.1) * 3; // gentle irregularity, feels hand-grown
    const angle = angleOffset + i * (360 / count) + jitter;
    const lenVar = len * (0.92 + (i % 3) * 0.05);

    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", petalPath(lenVar, width));
    p.setAttribute("fill", `url(#${gradId})`);
    p.setAttribute("transform", `rotate(${angle})`);
    g.appendChild(p);
  }

  parentG.appendChild(g);
  g.setAttribute("transform", "scale(0.05)");
  return g;
}

/** Small green calyx leaflets wrapping the base of the flower. */
function buildSepals(parentG) {
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", "sepals");
  const count = 5;
  for (let i = 0; i < count; i++) {
    const angle = i * (360 / count) + 10;
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", petalPath(15, 5.5));
    p.setAttribute("fill", "url(#sepalGrad)");
    p.setAttribute("transform", `rotate(${angle})`);
    g.appendChild(p);
  }
  parentG.appendChild(g);
  g.setAttribute("transform", "scale(0.05)");
  return g;
}

/** The tapered, still-closed bud that later fades out as petals open. */
function buildBudcap(parentG) {
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", "budcap");
  const p = document.createElementNS(SVG_NS, "path");
  p.setAttribute("d", "M-6,0 C -9,-18 -6,-34 0,-40 C 6,-34 9,-18 6,0 Z");
  p.setAttribute("fill", "url(#budGrad)");
  g.appendChild(p);
  parentG.appendChild(g);
  g.setAttribute("transform", "scale(0.05)");
  return g;
}

/** Dense spiral cluster of tiny florets forming the flower's centre disc. */
function buildCenter(parentG) {
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", "center");
  const count = 34;
  for (let i = 0; i < count; i++) {
    const angle = i * 137.508 * (Math.PI / 180); // golden-angle spiral
    const r = 1.15 * Math.sqrt(i);
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);

    const c = document.createElementNS(SVG_NS, "circle");
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

/**
 * Builds the complete internal structure of one flower (sepals, three
 * petal rings, centre disc, and the closed bud cap) inside an
 * already-positioned container <g>, and returns references to every
 * animatable part.
 */
function buildFlower(containerG) {
  containerG.innerHTML = "";
  const sepals = buildSepals(containerG);
  const ring1 = buildRing(containerG, "ring1", 10, 34, 9, "petalGradOuter", 0);
  const ring2 = buildRing(containerG, "ring2", 9, 25, 7, "petalGradMid", 20);
  const ring3 = buildRing(containerG, "ring3", 7, 16, 5, "petalGradInner", 10);
  const center = buildCenter(containerG);
  const budcap = buildBudcap(containerG); // added last so it sits on top while closed
  return { sepals, ring1, ring2, ring3, center, budcap };
}

/* =========================================================================
   4. FLOWER STAGE TRANSITIONS
   Each flower moves through three visual states: budding -> blooming ->
   fully open. Durations are deliberately slow and eased for a gentle,
   satisfying "petals unfurling" feel rather than a snap-open effect.
   ========================================================================= */

function flowerBud(refs) {
  showPart(refs.sepals, 1, 1000, 0.3);
  showPart(refs.budcap, 1, 1200, 0.2);
}

function flowerBloom(refs) {
  refs.budcap.classList.add("fadeout");
  showPart(refs.ring1, 0.8, 1900, 0.05);
  showPart(refs.ring2, 0.75, 2000, 0.05);
}

function flowerFull(refs) {
  animateScale(refs.ring1, 1, 1700, { fromScale: 0.8, easing: easeOutCubic });
  animateScale(refs.ring2, 1, 1700, { fromScale: 0.75, easing: easeOutCubic });
  showPart(refs.ring3, 1, 1700);
  showPart(refs.center, 1, 1400);
}

function resetFlower(refs) {
  resetPart(refs.sepals);
  resetPart(refs.ring1);
  resetPart(refs.ring2);
  resetPart(refs.ring3);
  resetPart(refs.center);
  resetPart(refs.budcap);
}

/* =========================================================================
   5. LEAF PLACEMENT + REVEAL
   ========================================================================= */

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

/** Creates every leaf element up front (hidden), ready to be revealed later. */
function createLeafElements() {
  Object.keys(leafPlacements).forEach((key) => {
    const p = leafPlacements[key];
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "leaf-item");

    const use = document.createElementNS(SVG_NS, "use");
    use.setAttributeNS(XLINK_NS, "href", "#leafShape");
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
  animateScale(item.el, item.finalScale, 1100, { baseTransform: item.baseTransform, fromScale: 0.05 });
}

function resetLeaves() {
  Object.keys(leafElements).forEach((key) => {
    const item = leafElements[key];
    item.el.classList.remove("show");
    item.el.setAttribute("transform", `${item.baseTransform} scale(0.05)`);
  });
}

/* =========================================================================
   6. WATER DROP + SPLASH EFFECTS
   ========================================================================= */

/** Spawns a single falling water drop, followed by a small splash on landing. */
function createWaterDrop() {
  const xOffset = Math.random() * 26 - 13;
  const startX = 150 + xOffset;
  const landY = 216;

  const drop = document.createElementNS(SVG_NS, "path");
  drop.setAttribute("d", "M0 0 C 3 5, 4 9, 0 12 C -4 9, -3 5, 0 0 Z");
  drop.setAttribute("class", "water-drop");
  drop.setAttribute("transform", `translate(${startX}, 18)`);
  dropsLayer.appendChild(drop);

  const duration = 620;
  const start = performance.now();

  function animateDrop(now) {
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const y = 18 + t * (landY - 18);
    const opacity = 1 - t * 0.5;
    drop.setAttribute("transform", `translate(${startX}, ${y})`);
    drop.style.opacity = opacity;

    if (t < 1) {
      requestAnimationFrame(animateDrop);
    } else {
      drop.remove();
      createSplash(startX, landY);
    }
  }
  requestAnimationFrame(animateDrop);
}

/** Small expanding ring effect at the point where a drop lands in the soil. */
function createSplash(x, y) {
  const ring = document.createElementNS(SVG_NS, "circle");
  ring.setAttribute("class", "splash-ring");
  ring.setAttribute("cx", x);
  ring.setAttribute("cy", y);
  ring.setAttribute("r", 1);
  dropsLayer.appendChild(ring);

  const duration = 420;
  const start = performance.now();

  function animateSplash(now) {
    const t = Math.min((now - start) / duration, 1);
    const r = 1 + t * 7;
    ring.setAttribute("r", r.toFixed(2));
    ring.style.opacity = 0.8 * (1 - t);

    if (t < 1) {
      requestAnimationFrame(animateSplash);
    } else {
      ring.remove();
    }
  }
  requestAnimationFrame(animateSplash);
}

/* =========================================================================
   SETUP — build all flower / leaf artwork once on load
   ========================================================================= */

flowerMainG.setAttribute("transform", "translate(149,63)");
flowerLeftG.setAttribute("transform", "translate(74,148) rotate(-18) scale(0.82)");
flowerRightG.setAttribute("transform", "translate(197,88) rotate(16) scale(0.82)");

const mainRefs = buildFlower(flowerMainG);
const leftRefs = buildFlower(flowerLeftG);
const rightRefs = buildFlower(flowerRightG);

createLeafElements();

/** Updates the small live "stage" pill above the scene. */
function setStage(text) {
  stageLabel.textContent = text;
}

/* =========================================================================
   7. EVENT HANDLERS
   ========================================================================= */

/* ---------- Step 1: Plant Seed (≈ 4 seconds) ---------- */
plantBtn.addEventListener("click", () => {
  plantBtn.disabled = true;
  setStage("Seed");

  // Seed falls naturally into the soil
  seedEl.classList.add("fall");

  // Soil shifts slightly as the seed lands
  setTimeout(() => {
    soilEllipse.classList.add("soil-shift");
    setTimeout(() => soilEllipse.classList.remove("soil-shift"), 600);
  }, 1500);

  // The seed disappears into the soil
  setTimeout(() => {
    seedEl.classList.add("hide");
  }, 1550);

  // Total seed sequence ≈ 4s, then Water Plant becomes available
  setTimeout(() => {
    waterBtn.disabled = false;
  }, 4000);
});

/* ---------- Step 2: Water Plant (≈ 5 seconds), then a 3s pause ---------- */
waterBtn.addEventListener("click", () => {
  waterBtn.disabled = true;

  // Can tilts in and begins pouring
  wateringCan.classList.add("pour");

  setTimeout(() => {
    waterInterval = setInterval(createWaterDrop, 170);
  }, 350);

  // Soil darkens as it absorbs water
  soilGroupParent.classList.add("soil-wet");

  // Water animation lasts ~5 seconds, then the can lifts away
  setTimeout(() => {
    clearInterval(waterInterval);
    wateringCan.classList.remove("pour");
  }, 5000);

  // Wait ~3 seconds of stillness before growth begins
  setTimeout(() => {
    growPlant();
  }, 5000 + 3000);
});

/* ---------- Step 3: Growth sequence (~12s growing + ~10s blooming) ---------- */
function growPlant() {
  setStage("Sprout");
  sprout.classList.add("show");

  // --- Growing phase (~12 seconds): stem rises, leaves unfurl one by one ---
  setTimeout(() => {
    sprout.classList.add("fade");
    stemMain.classList.add("grow");
    setStage("Small Plant");
  }, 1000);

  setTimeout(() => showLeaf("p1L"), 2600);
  setTimeout(() => showLeaf("p1R"), 3400);

  setTimeout(() => {
    stemBranchL.classList.add("grow");
    showLeaf("branchL");
  }, 3800);

  setTimeout(() => {
    setStage("Bud");
    showLeaf("p2L");
  }, 5300);
  setTimeout(() => showLeaf("p2R"), 6100);

  setTimeout(() => {
    stemBranchR.classList.add("grow");
    showLeaf("branchR");
  }, 6500);

  setTimeout(() => showLeaf("p3L"), 8000);
  setTimeout(() => showLeaf("p3R"), 8800);

  setTimeout(() => flowerBud(mainRefs), 9600);
  setTimeout(() => flowerBud(leftRefs), 10400);
  setTimeout(() => flowerBud(rightRefs), 11200);

  // --- Blooming phase (~10 seconds): three flowers open, one after another ---
  setTimeout(() => {
    setStage("Blooming");
    flowerBloom(mainRefs);
  }, 12000);
  setTimeout(() => flowerFull(mainRefs), 14800);

  setTimeout(() => flowerBloom(leftRefs), 15800);
  setTimeout(() => flowerFull(leftRefs), 18600);

  setTimeout(() => flowerBloom(rightRefs), 19600);
  setTimeout(() => flowerFull(rightRefs), 22400);

  setTimeout(() => setStage("Full Bloom"), 22400);

  // --- Final message (fades in smoothly and stays on screen) ---
  setTimeout(() => {
    message.classList.remove("hidden");
    // Force a reflow so the "reveal" transition reliably triggers
    void message.offsetWidth;
    message.classList.add("reveal");
  }, 24800);
}

/* =========================================================================
   8. REPLAY / RESET
   ========================================================================= */
replayBtn.addEventListener("click", resetScene);

/** Returns every element to its initial, pre-animation state. */
function resetScene() {
  seedEl.classList.remove("fall", "hide");
  soilGroupParent.classList.remove("soil-wet");
  soilEllipse.classList.remove("soil-shift");
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

  message.classList.remove("reveal");
  message.classList.add("hidden");
  setStage("Seed");

  if (waterInterval) {
    clearInterval(waterInterval);
    waterInterval = null;
  }
  dropsLayer.innerHTML = "";
}
