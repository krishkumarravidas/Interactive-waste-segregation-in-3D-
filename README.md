# WasteWise: Interactive Waste Segregation Training Simulation

WasteWise is a browser-based 3D training simulation that helps households practise sorting everyday waste into wet, dry, and hazardous bins. It was developed for the BMSIT Societal Project (1BSOP308), supporting SDGs 6, 11, and 12.

**Live site:** [Open the training simulation](https://krishkumarravidas.github.io/Interactive-waste-segregation-in-3D-/)

The site is a static build and needs no account or server. It works in modern desktop and mobile browsers.

## How the training simulation works

1. **Optional start details:** Learners can enter an age group, area type, and whether they have segregated waste before. These fields can be left blank.
2. **Pre-test:** Sort 10 items without correctness feedback to record a baseline.
3. **Training:** Sort 20 items with immediate feedback, a short explanation for each item, score, and streak.
4. **Post-test:** Sort 10 more items without correctness feedback.
5. **Review:** Compare pre-test and post-test accuracy, see the score change and up to three commonly missed items, then download the session log as CSV.

The start screen also has a short, expandable guide to the stages, controls, results, and privacy. Interface text is available in English, Kannada, and Hindi.

### Controls

- Drag an item onto a bin with a mouse, or touch and drag it on a phone or tablet.
- Alternatively, select an item and press **1** for wet, **2** for dry, or **3** for hazardous.
- Follow the displayed bin labels and icons; colour is not the only category cue.

Practice answers show the correct bin, a one-line disposal tip, and a visual consequence. Pre-test and post-test answers are recorded without revealing correctness, so the before-and-after comparison remains meaningful.

## Run locally

- Install Node.js 20.19+ or 22.12+.
- Run `npm install`.
- Run `npm run dev` and open the local URL printed by Vite.
- Run `npm run build` to create the static deployable `dist/` directory.
- Run `npm run preview` to serve the production build locally.
- Run `npm test` to execute the Vitest scoring and category checks.

## Session data and privacy

There is no sign-in. Session records are kept in the current browser's `localStorage`. Use **Download CSV** on the result screen to export the session data. The CSV includes the session ID, optional learner details, pre-test and post-test scores, item mistakes, and duration.

An optional Google Apps Script endpoint can be configured with `VITE_LOG_URL` at build time. When configured, the simulation makes a non-blocking POST attempt; a failed request does not interrupt the session. Leave this variable unset to keep records in the browser only.

## Project structure

```text
src/
  analytics/log.js       Local session storage, optional POST, and CSV export
  data/items.json        Waste examples, categories, shapes, and disposal tips
  game/                  Session state, learning flow, and scoring logic
  i18n/                  English, Kannada, and Hindi interface strings
  scene/                 Three.js scene, item models, and visual effects
  ui/                    Start screen, guide, training HUD, and result review
.github/workflows/       GitHub Pages build and deployment workflow
```

The app uses Vite, vanilla JavaScript, and Three.js. The scene is generated from primitive geometry, with raycasting for item selection and lightweight animations for feedback. Scoring and session flow are separate from the scene and UI, and item definitions are data-driven. The project avoids downloaded 3D models and audio assets; short optional sound cues are synthesized in the browser. On phones, rendering quality is reduced to help performance. The interface uses system font fallbacks if the optional Google Fonts request is unavailable.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy.yml` builds and deploys `dist/` when changes are pushed to `main`. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the deployment source.

The Vite base path is configured for this repository in `vite.config.js` as `/Interactive-waste-segregation-in-3D-/`. Update it if deploying under another repository path or a custom domain.

## Design choices and limitations

- Difficulty is selectable at the start. Easy uses more obvious examples; medium mixes the item set; hard introduces confusing examples such as tetra packs, greasy pizza boxes, and thermocol early. Each round keeps the same number of items.
- Waste collection rules can vary between cities. Tips encourage learners to follow their local collection guidance where appropriate.
- Sound is off by default. When enabled, brief synthesized feedback cues use the browser audio API.
- No learner data is sent to a service unless `VITE_LOG_URL` is explicitly configured.
