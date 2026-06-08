&lt;h1 align="center"&gt;
  &lt;svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 64 64" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 12px;"&gt;
    &lt;rect width="64" height="64" rx="12" fill="#0D0D0F"/&gt;
    &lt;rect x="12" y="36" width="8" height="16" fill="#C8F135"/&gt;
    &lt;rect x="24" y="24" width="8" height="28" fill="#C8F135" opacity="0.7"/&gt;
    &lt;rect x="36" y="16" width="8" height="36" fill="#C8F135" opacity="0.5"/&gt;
    &lt;rect x="48" y="28" width="8" height="24" fill="#C8F135" opacity="0.3"/&gt;
    &lt;circle cx="16" cy="32" r="3" fill="#F0EFE9"/&gt;
    &lt;circle cx="28" cy="20" r="3" fill="#F0EFE9"/&gt;
    &lt;circle cx="40" cy="12" r="3" fill="#F0EFE9"/&gt;
    &lt;circle cx="52" cy="24" r="3" fill="#F0EFE9"/&gt;
    &lt;polyline points="16,32 28,20 40,12 52,24" stroke="#F0EFE9" stroke-width="1.5" fill="none" stroke-dasharray="3 2"/&gt;
  &lt;/svg&gt;
  &lt;span style="vertical-align: middle; font-weight: 600; letter-spacing: -0.5px;"&gt;metric.log&lt;/span&gt;
&lt;/h1&gt;

&lt;p align="center"&gt;
  a lightweight dashboard for tracking community impact across multiple locations.
&lt;/p&gt;

&lt;p align="center"&gt;
  &lt;img src="https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=white" alt="React"/&gt;
  &lt;img src="https://img.shields.io/badge/vite-4-646CFF?logo=vite&logoColor=white" alt="Vite"/&gt;
  &lt;img src="https://img.shields.io/badge/tailwind-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind"/&gt;
  &lt;img src="https://img.shields.io/badge/express-4-000000?logo=express&logoColor=white" alt="Express"/&gt;
&lt;/p&gt;

---

## what it does

metric.log is a simple, focused tracking tool built for a volunteer initiative. it collects weekly metrics from multiple sites — items collected, kits assembled, funds raised, volunteer hours — and presents them in a clean, visual dashboard.

the goal is to make coordination effortless: site representatives submit their numbers, and the dashboard updates in real time. no spreadsheets, no email threads, no confusion about who's reporting what.

## features

- **aggregated logs** — track resources, hours, and milestones in one place
- **cross-site comparison** — see how locations stack up, spot trends, identify peak periods
- **live submission** — site reps submit directly; data reflects instantly
- **export ready** — download reports as csv for presentations or archives

## tech stack

| layer | tool |
|-------|------|
| frontend | react + vite + tailwind css |
| backend | express.js + sqlite |
| visualization | recharts |
| state | tanstack query + zustand |

## a quick note

this project was built for a specific volunteer program and is currently in active use. the repository will be made fully public once the program concludes. in the meantime, feel free to explore the structure and approach.

## local setup

```bash
# clone
git clone https://github.com/pranayakhadgi/volunteer-stat-tracker.git
cd volunteer-stat-tracker

# install dependencies
cd client && npm install
cd ../server && npm install

# run dev
cd ../server && npm run dev      # api on :3001
cd ../client && npm run dev      # app on :5173
