[Uploading README (2).md…]()
# Growing Plant Animation

A realistic, illustration-style interactive web project where a seed is
planted, watered with an animated watering can, and grown — stage by
stage — into a fully bloomed dahlia-style plant with three flowers. Every
element (pot, watering can, leaves, and flowers) is built from detailed,
layered SVG graphics, not flat cartoon shapes.

## Growth Stages

The plant advances smoothly through six realistic stages, matching a
seed-to-full-bloom reference growth chart:

1. **Seed** — planted into the soil
2. **Sprout** — the first tiny shoot breaks the surface
3. **Small Plant** — the stem rises and the first pair of leaves unfurl
4. **Bud** — a second leaf pair appears and a closed, tapered bud forms
5. **Bloom** — the bud opens into a layered, multi-petal flower and a
   side branch begins budding
6. **Full Bloom** — all petal layers and the flower's center fully open,
   a third leaf pair fills in, and two additional flowers bloom on side
   branches for a full, layered look

The entire sprout → full bloom sequence runs smoothly over roughly
30–35 seconds.

## Features

- 🌱 **Plant Seed** button — an SVG seed falls into the pot and disappears into the soil.
- 💧 **Water Plant** button — an illustrated SVG watering can tilts in and pours animated droplets; the soil visibly darkens (enabled only after the seed is planted).
- 🌿 A realistic multi-ring dahlia flower built from layered SVG petals (outer, middle, and inner rings) with gradient shading and a detailed spiral-patterned center, closely following the reference illustration's proportions and blooming style.
- 🍃 Detailed SVG leaves with a serrated silhouette, gradient shading, and visible veins, reused and placed along the stem and side branches.
- 🌳 A main stem plus two side branches, each growing and blooming in sequence to build a full, natural-looking plant with three flowers.
- 🏷️ A live stage label (Seed, Sprout, Small Plant, Bud, Blooming, Full Bloom) that updates as the plant grows.
- 🌸 A friendly success message once the plant reaches full bloom.
- 🔁 **Replay** button to reset the entire scene and run the animation again.
- Clean dark theme with soft shadows and gradients — no external libraries, images, or frameworks.

## Technologies

- **HTML5** — page structure and inline SVG graphics
- **CSS3** — gradients, opacity transitions, and stroke-based stem "growing" animation
- **Vanilla JavaScript** — builds the layered flower and leaf SVGs at runtime and drives every scale/bloom animation frame-by-frame with `requestAnimationFrame` for smooth, correctly-pivoted growth (no libraries or frameworks used)

## How to Run

1. Download or clone this project folder.
2. Make sure the following files are together in the same folder:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
3. Open `index.html` directly in any modern web browser (double-click it, or right-click → Open With → your browser).
4. Click **🌱 Plant Seed**, then **💧 Water Plant**, and watch the plant grow through every stage.
5. Click **Replay** at the end to run the full growth animation again.

No installation, build step, server, or internet connection is required.
