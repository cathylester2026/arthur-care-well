# Arthur · Care Well — Single Player v1.0.0

## What changed since v0.9

The six optional **Design Moments** are now two compact, focused screens:

1. **Explore the Futures:** three image-led alternatives, brief labels, and the central design question.
2. **Understand the Impact:** one chosen image, what it enables for Arthur, what ACHC must take on, and a single switchable discipline view (Architecture / Functional Planning / Engineering).

An optional expandable section retains the **Protect at opening** and **Enable as the model evolves** guidance. Persistent bottom navigation provides Return to Arthur / Continue and Compare Futures / Return to Arthur. No new required rounds, budgets, decision cards, or scoring rules have been introduced.

## Installation

Unzip the contents into the root of the existing GitHub Pages repository, replacing prior copies of `index.html`, `styles.css`, `app.js`, `design-ui.js`, `design-moments.js`, `config.js`, and `README.md`; keep the entire `assets` directory. Commit and refresh the published site, using a hard refresh if the browser has cached v0.9 assets.

No build system, backend, or additional services required. Asset names and page URLs remain relative for project GitHub Pages hosting.

## Testing scope

- JavaScript syntax checks: app.js and design-ui.js passed.
- Chromium browser UI: all six Design Moments tested at 1365×900 and 390×844. Tested option selection, Explore → Impact, each of the three discipline tabs, Impact → Explore, opening-day disclosure and modal close. No JavaScript page errors were observed in these tests.
- These tests ran in a browser with the application source injected because direct navigation to local files was blocked by the environment. Packaged image assets are present and were validated as files; this is **not** a confirmed visual test of GitHub Pages deployment.
- The existing v0.9 single-player game logic and source data are otherwise unchanged; this pass did not repeat the full portfolio regression sweep.

All Design Moment text and images are illustrative discussion material, not approved ACHC architectural drawings, clinical operating policies or engineering requirements.
