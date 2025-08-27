import { Router } from "express";
import type { D2Session, StatWeights, ArmorItem } from "../types.js";
import { BungieApi } from "../bungie.js";
import {
  mapDestinyToAppStats,
  inferSlot,
  isArmor,
  isExotic,
  extractSetName,
} from "../utils/stats.js";
import { optimize } from "../utils/optimizer.js";

const router = Router();
const COMPONENTS = [100, 102, 200, 201, 205, 300, 304];

const globalDefCache = new Map<number, any>();

function requireSession(req: any): D2Session {
  const raw = req.cookies?.d2_session;
  if (!raw) throw new Error("Not authenticated");
  return JSON.parse(raw);
}

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

router.post("/optimize", async (req, res) => {
  const session = requireSession(req);
  if (!session.membership) throw new Error("No membership");

  const {
    weights,
    preferSet,
    enforceOneExotic = true,
  } = (req.body || {}) as {
    weights: StatWeights;
    preferSet?: string;
    enforceOneExotic?: boolean;
  };
  if (!weights) return res.status(400).json({ error: "Missing weights" });

  const api = new BungieApi(session.access_token);
  const prof = await api.getProfile(
    session.membership.membershipType,
    session.membership.membershipId,
    COMPONENTS
  );

  const allItemComponents: any[] = [];
  const byStats = prof.itemComponents?.stats?.data || {};

  for (const inv of Object.values<any>(prof.characterInventories?.data || {})) {
    allItemComponents.push(...(inv.items || []));
  }
  for (const eq of Object.values<any>(prof.characterEquipment?.data || {})) {
    allItemComponents.push(...(eq.items || []));
  }
  allItemComponents.push(...(prof.profileInventory?.data?.items || []));

  const seen = new Set<string>();
  const uniques = allItemComponents.filter((it) => {
    const key = it.itemInstanceId || `${it.itemHash}-${it.bucketHash || "x"}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const hashes = uniques.map((u) => u.itemHash);
  const defs = await fetchDefinitions(api, hashes, 16);

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

  const result = optimize(armor, {
    weights,
    preferSet,
    enforceOneExotic,
    perSlotLimit: 40,
  });
  res.json({ result });
});

export default router;
