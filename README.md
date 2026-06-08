# metric.log - an internship side project

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
