# WasteWise: Interactive Waste Segregation Training Simulation

A browser-based 3D training simulation for household waste sorting, developed for BMSIT Societal Project (1BSOP308) and SDGs 6, 11, and 12. It runs as a static site and needs no account or server.

## Run locally

- Install Node.js 20.19+ or 22.12+.
- Run `npm install`.
- Run `npm run dev` and open the local URL printed by Vite.
- Run `npm test` for the scoring and category checks.
- Run `npm run build` to create the deployable `dist/` directory; `npm run preview` serves that build locally.

## Training simulation

The optional start form records age group, area type, and prior segregation practice. Each session has a 10-item baseline, 20-item guided practice round, and 10-item learning check. Results compare baseline and post-training accuracy, list up to three most-missed post-test items, and can be downloaded as CSV. Session records remain in the current browser's local storage.

Drag or touch-hold the object in the 3D scene and release it over a bin. You can also select a bin chip and use 1 / 2 / 3 on the keyboard after picking up an item. Practice answers show a visual consequence and a short disposal tip; the baseline and final check record answers without feedback. Use the language menu for English, Kannada, and Hindi.

## Architecture

Vanilla JavaScript and Three.js handle the lightweight scene, pointer raycasting, and simple animated feedback. Session state and scoring are separate modules; waste item definitions are JSON data; the UI is rendered from small UI modules. Session capture is local-first. Set `VITE_LOG_URL` to an optional Google Apps Script endpoint to attempt a non-blocking POST; remote submission errors do not interrupt the session.

The scene uses procedural primitive geometry only. Phone-sized screens use reduced pixel ratio and antialiasing is disabled. There are no downloaded 3D models, audio files, or other external assets. The interface uses system fallbacks if its optional Google Fonts request is unavailable. No third-party visual assets are included.

## GitHub Pages deployment

The workflow in `.github/workflows/deploy.yml` builds and deploys `dist/` on pushes to `main`. In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source. The Vite base path is set to `/Interactive-waste-segregation-in-3D-/` for this repository. Change `base` in `vite.config.js` if deploying under a different repository name or a custom domain.

## Notes

Difficulty selection is represented by the item pool: the standard flow uses familiar items, while the harder pool includes the confusing tetra pack, greasy pizza box, and thermocol examples. This keeps session length fixed for comparable field-demo measurements. Disposal rules can vary by city; the tips recommend checking local collection guidance where needed. Sound is off by default; the control is present for the requested accessibility setting, and the current simulation does not ship sound files.
