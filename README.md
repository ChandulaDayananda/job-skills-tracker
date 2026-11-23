# Job Skills Tracker

A checklist app for tracking the skills you need to learn for the jobs you're targeting.
Each skill is a checkbox with a "what it is" description and a "checked means…" description; roles show how close you are to meeting their requirements.

Built with React + TypeScript + Vite. The skills and roles live in [`public/data.json`](public/data.json).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## How it works

- **Skills tab**: search, filter by category/status, sort by how many roles need each skill. Tick a skill to see its "checked" description; open it to add notes.
- **By role tab**: each role's requirements and bonus skills, with a readiness bar and a link to the original job description.
- **Progress** is stored in your browser's `localStorage`. Use **Export progress / Import progress** to move it between browsers or devices.

## Updating the skills list

Edit `public/data.json`:

- `skills[]`: `id` (keep stable, progress is keyed by it), `name`, `cat`, `desc`, `check`, `added`.
- `roles[]`: `must[]` / `nice[]` hold skill ids.
- `sources[]` and `changelog[]` record which job description files were read.

Never rename or delete a skill `id`, or the ticks saved against it are lost.

## Deploy to GitHub Pages

A workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

> Note: GitHub Pages sites are public even when the repo is private on most plans. `data.json` contains skills derived from job descriptions, not the descriptions themselves, but check before enabling Pages.
