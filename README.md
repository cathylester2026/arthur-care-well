# Arthur · Care Well — single-player replacement (v0.2.0)

Drop-in static GitHub Pages app. Replace **all files** in your repository root with the files in this package. No build, no install, no database required.

## How to deploy
1. Upload `index.html`, `app.js`, `styles.css`, `config.js`, `.nojekyll` to the repository root, overwriting the old versions.
2. Confirm GitHub Pages deploys from `main` / root.
3. Hard-refresh the page (Ctrl+Shift+R).
4. Select one option at each of three decisions, strengthen one choice, view the disruption, then resolve to the result.

## What was fixed
- End-to-end budget checking so no choice leads to an impossible final decision.
- Budget changed to Capital **7**, Change **8**, Operations **7**, permitting each two-decision strategy to reach at least one third choice while preserving constraints.
- Invalid choices are visibly disabled before selection with a reason, rather than appearing to succeed then hitting a dead end.
- Returning to a previous decision clears incompatible later selections and strengthening.
- Result review starts a consistent new decision branch rather than mixing old and new choices.
- Local storage is versioned (`arthur-care-well-v2`) so incompatible old sessions cannot break progression.
- Event handlers are delegated, eliminating embedded inline action JavaScript.
- Results narrate Arthur's experience at each step and link to the visioning deck's five design translation categories.
- Outcome telemetry cannot be duplicated by reopening a completed result.

## What wasn't changed
- Original nine capability options, their costs/impacts, strengthening and synergy data.
- Six-dimension outcome model and its qualitative reveal classification.
- Multi-player mode: not included or required.

## Persistence and optional telemetry
`localStorage` records the single-player run on the device. Supabase telemetry is intentionally not loaded by default, so network/CDN failure cannot block the single-player game. To enable telemetry later, restore `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` in `index.html` before `config.js`, then fill `config.js` with a public URL and **anon/publishable** key after creating your own secure event/run tables and RLS policies. Never put a service-role key in browser JavaScript. The original ZIP references a `supabase-schema.sql` that was **not supplied**, so no database schema is included in this replacement.

## Testing
Run in any static web server or GitHub Pages. Check browser developer console if the page stays blank. `app.js` is syntax-checkable using `node --check app.js`.
