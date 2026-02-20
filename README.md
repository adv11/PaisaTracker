# PaisaTracker

PaisaTracker is a privacy-first personal finance PWA for budgeting, expense tracking, goals, reminders, reports, and udhaar management.

## Live App

- Deployed URL: [https://paisatrackerr.netlify.app/](https://paisatrackerr.netlify.app/)

## Highlights

- Multi-account local profiles
- PIN lock + optional biometric login (WebAuthn)
- Transaction tracking (income, expense, investment, transfer, udhaar)
- Budget management and alerts
- Goals with savings progress/history
- Bill reminders and notification support
- Reports + CSV export
- Offline support via Service Worker
- Installable as a mobile/desktop PWA

## Tech Stack

- HTML, CSS, Vanilla JavaScript
- Browser `localStorage` for persistence
- Service Worker + Web App Manifest
- Chart.js for analytics visuals

## Local Development

### Option 1: Python dev server (recommended)

```bash
python3 server.py
```

Open: `http://localhost:4321`

### Option 2: Any static server

Serve the project root as static files.  
Do not open via `file://` if you want Service Worker/PWA behavior.

## Project Structure

```text
.
├── index.html
├── service-worker.js
├── manifest.json
├── css/
├── js/
│   ├── screens/
│   ├── tabs/
│   └── sheets/
├── icons/
├── netlify.toml
└── vercel.json
```

## Data & Security Notes

- Data is stored locally in the browser (`localStorage`) on the user device.
- This is a client-side app (no backend database by default).
- Users should export backups regularly from the Profile tab.
- If browser storage is cleared or device is lost, local data can be lost.

## Deployment

### Netlify

- Config included: `netlify.toml`
- Publish directory: project root

### Vercel

- Config included: `vercel.json`
- Static deploy from project root

## Browser Support

- Latest Chrome, Edge, Safari, and Firefox
- Best experience on modern mobile browsers with PWA support

## License

This repository currently has no license file. Add one if you want open-source usage permissions.
