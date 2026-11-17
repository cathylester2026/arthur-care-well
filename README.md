# Arthur · Care Well — v0.6

Complete, standalone single-player GitHub Pages build. No bundler, database, or external assets required.

## Deploy

Extract **all eight files** to the repository root (where `index.html` lives): `index.html`, `app.js`, `styles.css`, `config.js`, `design-moments.js`, `design-ui.js`, `.nojekyll`, and this `README.md`. Commit, then refresh with a cache-clearing reload. Expected display version: `care-well-sp-0.6.0`.

## What changed

- Added six optional **Design Moments** corresponding to the presentation's six shifts: Access, Connected Care, Distributed Care, Intelligent Work, Visible Operations, Adaptable Environments.
- Four particularly developed topics: registration and independent providers, departmental versus shared diagnostics, room adaptability, and shared-capacity authority. Each offers three visual alternatives with explicit benefit, sacrifice, architecture, functional planning, engineering, opening-day and future implications.
- Added original, responsive concept diagrams; no third-party photo assets or licensed media.
- Added a visual Design Moment entry point on design-choice cards, the registration discussion, and the Design & Operations/closing screens; a gallery lets the user explore all six at any time.
- These panels are optional and **do not alter gameplay scoring, budgets or outcomes**. The original v0.5 single-player stages remain: 3 decisions, readiness/registration, 2 disruption beats, lens, commitment, outcome.
- New local storage namespace for v0.6 avoids restoring incompatible older sessions.

## Visioning boundary

Design Moments are **illustrative hypotheses** for stakeholder discussion, not approved room criteria, clinical workflows, procurement commitments or technology specifications. Confirm engineering capacity, privacy, regulatory and clinical governance requirements before adoption.

## Validation

Use a modern browser. Smoke-test: begin → select three affordable investments → select priority and registration → both disruption screens → operations/design lens → commitment → final result. Revisit choices and try Design Moments without losing state. `node --check app.js`, `node --check design-ui.js` and `node --check design-moments.js` should all pass.
