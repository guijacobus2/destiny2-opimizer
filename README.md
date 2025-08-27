# Destiny 2 – Armor Optimizer (Stats 200-cap + Set Bonuses)

Full-stack TypeScript app (React + Vite on the client, Node + Express on the server) that:
- Authenticates with Bungie OAuth
- Reads **all items** from **all 3 characters + Vault**
- Renames/re-maps stats for the new expansion (Mobility→Weapons, Resilience→Health, Recovery→Class, Discipline→Grenade, Intellect→Super, Strength→Melee)
- Treats armor stats on a **0–200** scale and supports **secondary bonuses past 100**
- Supports **armor set bonuses** (e.g., Edge of Fate 2-piece / 4-piece) and **archetypes**
- Produces *simple* UI to filter + optimize a loadout based on your chosen stat weights
- Uses official Bungie item icons in the UI

> ⚠️ Notes
> - Optimizer logic here is a solid baseline (fast meet-in-the-middle with constraints); adjust scoring to your needs.
> - Set bonus/archetype specifics are configurable in `server/src/utils/stats.ts`.
> - This project minimizes Manifest work by calling `GetDestinyEntityDefinition` per unique item hash and caching the results in-memory.
>   For heavy production usage, switch to a local Manifest (SQLite/JSON).

---

## 1) Prereqs

- Node 18+ and npm (or pnpm/yarn)
- A Bungie API key + OAuth client (create at https://www.bungie.net/en/Application)
  - Add an OAuth redirect URI: `http://localhost:8787/auth/callback` (or your server URL)

## 2) Configure

Create **server/.env** from the example and fill your values:

```ini
# server/.env
BUNGIE_API_KEY=your_api_key_here
BUNGIE_CLIENT_ID=your_client_id_here
BUNGIE_CLIENT_SECRET=your_client_secret_here
BUNGIE_REDIRECT_URI=http://localhost:8787/auth/callback
SESSION_SECRET=dev_change_me
CLIENT_APP_ORIGIN=http://localhost:5173
```

Optionally set a custom server port via `PORT` (default 8787).

## 3) Install & Run (Dev)

```bash
# in one terminal
cd server
npm i
npm run dev

# in a second terminal
cd ../client
npm i
npm run dev
```

Open the client at http://localhost:5173 and click **Sign in with Bungie**.

## 4) Build (Prod)

```bash
cd client && npm run build
# serve 'dist' behind any static server or reverse proxy that forwards /api & /auth to your Node server
```

## 5) Where to tweak logic

- **Stat mapping & secondary bonuses**: `server/src/utils/stats.ts` and `client/src/lib/stats.ts`
- **Set bonuses (2/4 pieces) & archetypes**: `server/src/utils/stats.ts` (editable map)
- **Optimization scoring**: `server/src/utils/optimizer.ts`

## 6) Useful Bungie Docs (for reference)

- OAuth endpoints & flow (authorize/token)  
- Get Profile (components 100/102/200/201/205/300/304)  
- Get Destiny Entity Definition (for names/icons/stats, etc.)

Enjoy! ✨
