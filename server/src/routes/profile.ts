import { Router } from "express";
import { BungieApi } from "../bungie.js";
import type { ArmorItem, D2Session } from "../types.js";
import {
  mapDestinyToAppStats,
  inferSlot,
  isArmor,
  isExotic,
  extractSetName,
} from "../utils/stats.js";

const router = Router();
const globalDefCache = new Map<number, any>(); // persists across requests in this process

function requireSession(req: any): D2Session {
  const raw = req.cookies?.d2_session;
  if (!raw) throw new Error("Not authenticated");
  return JSON.parse(raw);
}

const COMPONENTS = [100, 102, 200, 201, 205, 300, 304]; // Profiles, ProfileInventories, Characters, CharacterInventories, CharacterEquipment, ItemInstances, ItemStats

// concurrent definition fetcher with caching
async function fetchDefinitions(
  api: BungieApi,
  hashes: number[],
  concurrency = 16
) {
  const unique = Array.from(new Set(hashes));
  const results = new Map<number, any>();
  let cursor = 0;

  await Promise.all(
    Array.from({ length: concurrency }).map(async () => {
      while (cursor < unique.length) {
        const idx = cursor++;
        const h = unique[idx];

        if (globalDefCache.has(h)) {
          results.set(h, globalDefCache.get(h));
          continue;
        }
        try {
          const def = await api.getDestinyEntityDefinition(
            "DestinyInventoryItemDefinition",
            h
          );
          globalDefCache.set(h, def);
          results.set(h, def);
        } catch {
          globalDefCache.set(h, null);
          results.set(h, null);
        }
      }
    })
  );
  return results;
}

router.get("/profile", async (req, res) => {
  const session = requireSession(req);
  if (!session.membership) throw new Error("No membership");

  const api = new BungieApi(session.access_token);
  const prof = await api.getProfile(
    session.membership.membershipType,
    session.membership.membershipId,
    COMPONENTS
  );

  // Collect items from each character inventory + equipment + profile inventory (Vault)
  const allItemComponents: any[] = [];
  const byStats = prof.itemComponents?.stats?.data || {};

  for (const inv of Object.values<any>(prof.characterInventories?.data || {})) {
    allItemComponents.push(...(inv.items || []));
  }
  for (const eq of Object.values<any>(prof.characterEquipment?.data || {})) {
    allItemComponents.push(...(eq.items || []));
  }
  allItemComponents.push(...(prof.profileInventory?.data?.items || []));

  // Deduplicate by instance if present, else by hash+bucket
  const seen = new Set<string>();
  const uniques = allItemComponents.filter((it) => {
    const key = it.itemInstanceId || `${it.itemHash}-${it.bucketHash || "x"}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Fetch all needed defs concurrently (cached globally)
  const hashes = uniques.map((u) => u.itemHash);
  const defs = await fetchDefinitions(api, hashes, 16);

  // Build ArmorItem array
  const armor: ArmorItem[] = [];
  for (const it of uniques) {
    const def = defs.get(it.itemHash);
    if (!def) continue;
    if (!isArmor(def)) continue;

    const instanceStats =
      byStats?.[it.itemInstanceId || ""]?.stats?.stats || {};
    const mapped = mapDestinyToAppStats(instanceStats);

    armor.push({
      itemInstanceId: it.itemInstanceId,
      itemHash: it.itemHash,
      name: def.displayProperties?.name || "Unknown",
      icon: def.displayProperties?.icon
        ? `https://www.bungie.net${def.displayProperties.icon}`
        : undefined,
      slot: inferSlot(def),
      isExotic: isExotic(def),
      setName: extractSetName(def),
      stats: mapped.appStats,
      rawStats: mapped.raw,
    });
  }

  res.json({ armor });
});

export default router;
