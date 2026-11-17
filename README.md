# Arthur · Care Well — Single Player v1.1

Full replacement for repository root (including `assets/`). No build step or external service required.

## What's new

- ACHC campus, Arthur, and four-stop baseline remain the required new-journey opening.
- Visiting the app always displays the story introduction. Use **Enter the Airdrie campus** for a fresh journey or **Resume saved journey** to continue previously saved v1.1 progress.
- **Meet ACHC & Arthur** in the top bar lets players return to the introduction without erasing their saved work.
- Every investment has two separate screens: **Impact** (benefit, resources, trade-off, future value) followed by **Arthur’s Reveal** (concrete, positive human-scale benefit, remaining dependency, design insight).
- Reveals for all nine investments; the major unexpected clinical event still happens later, after opening-day prioritization and registration selection.
- Existing two-screen Explore Futures / Understand Impact design moments are preserved.
- New version-specific storage key `arthur-care-well-v11` avoids old sessions skipping the new story. Existing v1.0 state remains untouched but is not migrated.

## Deployment

Copy the ZIP contents directly into the root of the GitHub Pages repository. Commit `index.html`, `app.js`, `styles.css`, `config.js`, `design-moments.js`, `design-ui.js`, `.nojekyll`, and the complete `assets/` folder. Verify the visible version `care-well-sp-1.1.0`.

## Narrative boundary

Arthur and the procedure are fictional. Pre-procedure tests are illustrative scenario requirements rather than clinical rules. Future operating arrangements are proposals for discussion, not approved ACHC specifications.
