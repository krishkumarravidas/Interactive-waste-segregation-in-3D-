# Codex Prompt: Interactive 3D Waste Segregation Training Simulator (Web)

## Role
You are a senior web/3D developer. Build a complete, working **browser-based interactive 3D training simulation** that teaches households to segregate waste correctly. Work inside this repository and commit as you go.

## Context
BMSIT Societal Project (1BSOP308), SDGs 6, 11, 12. Target users: general households of any age, no gaming experience. Call it an **"interactive training simulation"**, never a "game". Must run on a laptop and a mid-range phone browser, with no install.

## Tech stack (fixed)
- Vite + vanilla JavaScript (or TypeScript) + **Three.js** (WebGL). No backend.
- Physics for pick/drop: simple raycasting + tweened animation (no heavy physics engine needed).
- Static build, deployable to **GitHub Pages** (set `base` in `vite.config.js`, add a `.github/workflows/deploy.yml` that builds and publishes `dist/`).
- Assets: use primitive geometry and free CC0 models only. Keep total bundle under 10 MB.

## Scene
A 3D kitchen / courtyard with three bins: **Wet (green)**, **Dry (blue)**, **Hazardous (red)**. A conveyor or table spawns one waste item at a time. Orbit camera is limited. Controls: mouse drag / touch drag to move the item, tap-hold to pick up, release over a bin to drop. Keyboard fallback: 1/2/3 to send the held item to a bin.

## Waste items (data-driven, `src/data/items.json`)
At least 24 items, each with `id`, `name`, `category` (wet/dry/hazardous), `model`/shape, `tip`.
- Wet: banana peel, vegetable scraps, tea leaves, leftover rice, egg shell, flowers
- Dry: plastic bottle, newspaper, cardboard box, glass jar, metal can, milk packet, chips wrapper, cloth
- Hazardous: battery, CFL/tube light, expired medicine, paint can, sanitary pad/diaper (wrapped), mobile e-waste, razor blade, insecticide spray

## Core loop
1. Item spawns, with its name shown.
2. Learner drags it to a bin.
3. **Instant visual consequence:**
   - Correct: bin glows, green tick, item goes in, small compost/recycle animation.
   - Wrong: red flash, item bounces back, and a consequence animation plays (e.g. battery in wet bin leaks and the bin turns toxic; plastic in wet bin shows contaminated compost).
4. A one-line "why" tip appears, using `tip` from the data.
5. Score, streak, and accuracy update.

## Modes
- **Pre-test (10 items, no feedback)** then **Training (20 items, feedback on)** then **Post-test (10 items, no feedback)**. Show before/after accuracy comparison at the end. This is the key field-demo metric.
- Difficulty levels: Easy (obvious items), Medium (mixed), Hard (confusing items: tetra pack, pizza box, thermocol).
- Language toggle: English / Kannada / Hindi (strings in `src/i18n/*.json`).

## Data capture (for the societal-project analysis)
- No login. Ask optional fields at start: age group, area type, has-segregated-before (Y/N).
- Log per session: pre score, post score, per-item correct/wrong, time taken.
- Store in `localStorage`; provide **"Download CSV"** button (columns: session_id, age_group, area_type, prior_practice, pre_score, post_score, mistakes_json, duration_s).
- Optional: `POST` to a Google Apps Script/Form URL read from `VITE_LOG_URL` if set. Never block gameplay if it fails.

## UI/UX
- Large touch targets, high-contrast colours, colour-blind safe icons on bins (leaf, recycle, skull).
- Intro screen with 3-step "how to play", result screen with a badge and a "your top 3 mistakes" summary.
- Responsive layout; lowest-quality mode automatically on phones (no shadows, lower pixel ratio).
- Accessibility: keyboard playable, ARIA labels on buttons, sound on/off toggle (short CC0 sound effects).

## Project structure
```
index.html
src/main.js
src/scene/{setup,bins,items,effects}.js
src/game/{state,flow,scoring}.js
src/ui/{menu,hud,result}.js
src/data/items.json
src/i18n/{en,kn,hi}.json
src/analytics/log.js
public/
.github/workflows/deploy.yml
README.md
```

## Deliverables / acceptance criteria
- `npm install && npm run dev` works; `npm run build` produces a static site.
- Playable end to end (pre-test → training → post-test → result → CSV download) on desktop Chrome and mobile Chrome/Safari.
- 60 fps on a mid-range laptop; no console errors.
- Unit tests (Vitest) for scoring and item-category logic.
- README with run, build, deploy (GitHub Pages) steps, a short architecture note, and credits for assets.
- Commit in small steps with clear messages.

## Out of scope
No Unreal Engine, no backend server, no user accounts, no ML in the app (the Logistic Regression analysis is done separately in Colab on the exported CSV).
