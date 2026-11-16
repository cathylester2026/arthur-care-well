# Arthur · Care Well — Single Player

A phone-first, static GitHub Pages prototype. It runs without a build step and uses localStorage for game state. Supabase is optional and is used only for append-only play telemetry.

## What is implemented
- 3 decisions with 3 options each
- Capital / Change / Operations constraints
- Strengthen investment after Decision 2
- Disruption reveal
- Six-condition result model
- Portfolio synergies and hard-gate outcomes
- Local save / resume
- Optional Supabase event and completed-run capture

## Deploy from the GitHub web interface
1. Create a new repository.
2. Upload every file in this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.
6. Open the Pages URL after deployment completes.

## Optional Supabase setup
1. Create or open a Supabase project.
2. In **SQL Editor**, run `supabase-schema.sql`.
3. Open **Project Settings / API** and copy the Project URL and publishable/anon key.
4. Edit `config.js` in GitHub and paste those two public browser values.
5. Never place a `service_role` key in this repository.

The SQL grants browser clients INSERT only. They cannot read, edit, or delete telemetry rows.

## Logic files
- `app.js`: game content, scoring, synergies, screens, persistence and telemetry
- `styles.css`: responsive visual system
- `config.js`: optional Supabase connection and game version
- `supabase-schema.sql`: telemetry tables and row-level-security policy

## Next logical build slice
1. Validate the nine option scores through repeated play.
2. Add more differentiated disruption reveals based on each exact portfolio.
3. Add Arthur imagery and transitional scene reveals.
4. Only after single-player logic is stable, add shared sessions / XPlayer.
