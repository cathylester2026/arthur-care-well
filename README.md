# Arthur · Care Well — v1.5 (single-player)

A complete GitHub Pages root replacement based on v1.4. The package contains `index.html`, `app.js`, `styles.css`, `config.js`, `design-ui.js`, `design-moments.js`, `.nojekyll` and the complete `assets/` directory. No build step or external service is required.

## New in v1.5

- **Three watershed decisions** inserted directly after Arthur's arrival, connected-care and departure investment reveals. Each uses three compact visual alternatives, with a gain, trade-off and specific spatial/operational consequence. These are operating-model choices, not new funded investments.
  1. **Arrival across three buildings:** Centralized, departmental or federated registration and welcome. The previous long registration form has been removed from opening-day readiness.
  2. **Care coordination:** Local departmental authority, a campus flow coordinator, or shared clinical/operational authority. The choice changes scheduling and capacity outcomes.
  3. **Adaptability under pressure:** Protected specialist settings, adaptable recovery environments, or a coordinated campus response. The simulation uses urgent-care escalation and transfer as planning questions—not as a claim ACHC will have a full emergency department.
- **Opening-day readiness** is now one compact priority choice. Other investments keep future value.
- **Response reserve:** If the player kept at least one Change and one Operations unit uncommitted, those units can be assigned during the disruption to limited manual coordination/exception handling. It cannot create new clinical capacity or override clinical decisions.
- **Improved design translation:** The Design & Operations Lens and copied brief include the three watershed consequences—cross-building movement, staffing/coordination, and adaptable/infection-prevention zoning.
- **Distinct departure visuals:** Fast Exit, Adaptive Recovery and Connected Wellness now use different existing scenes. Digital Arrival remains unchanged.
- **Responsive layout:** Watersheds are designed to fit a standard desktop viewport and stay tap-friendly at phone size. Longer mobile screens may scroll when required for readable text.
- Version-specific save key `arthur-care-well-v15` avoids restoring an incompatible older session.

## Gameplay sequence

ACHC → Arthur → four-stop baseline → How to Play → investments 1–3, each followed by Impact → Arthur Reveal → Watershed → opening-day priority → clinical disruption → capacity pressure / optional reserve → Design & Operations → commitment → two-part result.

## Deploy

Unzip the archive into the **root** of the `arthur-care-well` GitHub Pages repository. Commit all files including the assets folder. The page version should read `care-well-sp-1.5.0`. Force refresh after publishing.

## Testing completed locally

- Six complete browser-rendered single-player journeys, including phone-width runs, through final results, with zero observed JavaScript errors.
- All 21 resource-affordable portfolios evaluated in the outcome engine with contrasting watershed models. All 21 produced a change in outcome pattern under the tested contrasting models.
- Three watershed screens checked at desktop and phone widths. No scrolling at 1365×860; at 390×860, the third watershed needs some vertical scrolling.
- `node --check` JavaScript syntax verification and ZIP integrity check.

These tests render the packaged HTML/CSS/JavaScript in an isolated Chromium page. They do **not** confirm the version currently deployed to GitHub Pages.

## Important simulation guardrail

This is a scenario-based design workshop simulation, not a clinical safety model or approved functional program. Partner referral acceptance, infection prevention, acuity management, escalation and transfer must be verified with ACHC clinical, operations, facilities and appropriate governance experts before being translated into actual requirements.
