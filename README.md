# Arthur · Care Well — v0.5 single-player

Deploy all six files in the root of the GitHub Pages repository. No build tools needed. Verify the banner shows `care-well-sp-0.5.0`. Reload without browser cache if necessary.

## Changes
- Existing nine design options and Capital/Change/Operations limits retained.
- Trade-off is shown before every design selection.
- The original strengthening screen has been replaced by an **opening-day readiness** decision after all three design choices. Only one investment is operational on opening day; the other two represent intended future design directions, not guaranteed live workflows. This is a deliberate simplification of phasing, not a prediction of clinical readiness.
- Registration choice: **centralized**, **department/setting**, or **federated**; all have real benefits and costs. None assumes an independent provider is owned by Covenant Health.
- Disruption includes a specialist run by an independent organization. The new partner moment tests confirmation of referral acceptance and the limitations of shared registration.
- Five consequence moments: arrival, clinical, operations, independent partner, transition. The Design & Operations Lens includes opening-day readiness and cross-organization obligations.
- Saved-state key is v5; earlier saves are intentionally not imported. Invalid over-budget restored portfolios are rejected.

## Intended discussion
This simulation illustrates operating-model trade-offs and future design implications. It is not an approved clinical pathway, formal budget, legal analysis, digital architecture, or staffing plan. Specific partner privacy, consent, registration, clinical and contractual agreements must be assessed by the responsible organizations.

## Testing
Run `node --check app.js`. The provided game is fully local and may be served by a basic static HTTP server or GitHub Pages.
