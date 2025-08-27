import type { StatKey } from '../types.js';

/**
 * Map Destiny stat hashes -> our 6 renamed stats.
 * Vanilla hashes for Mobility/Resilience/Recovery/Discipline/Intellect/Strength remain the same,
 * but we relabel them according to the new expansion.
 */
export const STAT_HASHES: Record<number, StatKey> = {
  2996146975: 'weapons', // Mobility -> Weapons
  392767087:  'health',  // Resilience -> Health
  1943323491: 'class',   // Recovery -> Class
  1735777505: 'grenade', // Discipline -> Grenade
  144602215:  'super',   // Intellect -> Super
  4244567218: 'melee',   // Strength -> Melee
};

/** Secondary bonus model past 100. Tweak as desired. */
export function secondaryBonus(stat: number): number {
  if (stat <= 100) return 0;
  // Example: each point above 100 yields an extra 0.5 effective stat.
  return (stat - 100) * 0.5;
}

/** Determine if an item def is Armor. */
export function isArmor(def: any): boolean {
  // Heuristic: itemTypeDisplayName contains armor parts OR has equippingBlock + armor tier types
  const type = (def?.itemTypeDisplayName || def?.itemTypeAndTierDisplayName || '').toLowerCase();
  return ['helmet','gauntlets','chest','leg','class item','cloak','bond','mark'].some(k => type.includes(k));
}

/** Exotic heuristic. */
export function isExotic(def: any): boolean {
  const tier = (def?.inventory?.tierTypeName || '').toLowerCase();
  return tier.includes('exotic');
}

/** Infer slot string. */
export function inferSlot(def: any): any {
  const t = (def?.itemTypeDisplayName || '').toLowerCase();
  if (t.includes('helmet')) return 'Helmet';
  if (t.includes('gauntlet')) return 'Gauntlets';
  if (t.includes('chest')) return 'Chest';
  if (t.includes('leg')) return 'Legs';
  if (t.includes('class') || t.includes('cloak') || t.includes('bond') || t.includes('mark')) return 'Class Item';
  return 'Unknown';
}

/** Try to extract a set name from the definition (for Edge of Fate etc). */
export function extractSetName(def: any): string | undefined {
  // Prefer setData if present:
  const setData = def?.setData;
  if (setData?.setHash && setData?.questLineName) return setData.questLineName;
  // Fallback: parse name prefix like "Edge of Fate _____"
  const name: string = def?.displayProperties?.name || '';
  const m = name.match(/^(Edge of Fate[^:]*)(:|\s|-)/i);
  return m ? m[1] : undefined;
}

/** Convert instance stats -> app stats */
export function mapDestinyToAppStats(instanceStats: any) {
  const raw: Record<string, number> = {};
  const appStats: Record<StatKey, number> = {
    weapons: 0, health: 0, class: 0, grenade: 0, super: 0, melee: 0
  };

  for (const [hashStr, s] of Object.entries<any>(instanceStats || {})) {
    const hash = Number(hashStr);
    const key = STAT_HASHES[hash];
    const val = s?.value ?? s;
    raw[hashStr] = val;
    if (key) appStats[key] = val;
  }

  return { raw, appStats };
}

/** Set bonus model – customize per set. */
export const SET_BONUSES: Record<string, { two?: Partial<Record<StatKey, number>>, four?: Partial<Record<StatKey, number>> }> = {
  // Example defaults; edit with real numbers when known.
  'Edge of Fate': {
    two:  { weapons: 5, class: 5 },
    four: { weapons: 10, class: 10, health: 10 },
  },
};

/** Archetype emphasis – if an item has an archetype tag, you can boost those stats. */
export const ARCHETYPE_BOOSTS: Record<string, Partial<Record<StatKey, number>>> = {
  // e.g., 'Artificer': { grenade: 5, melee: 5 }
};
