# Planner 71 — selected-footway endpoint historical evidence

Planner 70 froze the selected continuation on OpenStreetMap way `1481578626` v1 and stopped at node `48920902` because that node's version-pinned coordinate was not present in the repository.

Planner 71 formalizes the exact historical evidence needed to continue without guessing:

- target timestamp: `2026-02-21T20:08:08Z`
- endpoint node: `48920902`
- source way: `1481578626`
- node page: `https://www.openstreetmap.org/node/48920902`
- node history endpoint: `https://api.openstreetmap.org/api/0.6/node/48920902/history`
- required capture fields: node version, timestamp, changeset, version URL, latitude, longitude

The current execution environment cannot reach the OpenStreetMap historical API endpoint, so Planner 71 intentionally does **not** invent those values.

## Result

The endpoint remains fail-closed:

- version not captured
- coordinate not captured
- changeset not captured
- connected-way topology not captured

Once the historical node record is reachable, the next planner can capture the exact versioned node and then inspect historical connected ways at the same frozen timestamp.
