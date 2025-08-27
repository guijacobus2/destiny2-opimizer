import type { ArmorItem, Loadout, StatKey, StatWeights } from '../types.js';
import { secondaryBonus, SET_BONUSES } from './stats.js';

/**
 * Compute a score for a loadout given weights and 200-cap + secondary bonuses.
 */
export function scoreTotals(totals: Record<StatKey, number>, weights: StatWeights): number {
  let score = 0;
  for (const k of Object.keys(weights) as StatKey[]) {
    const base = totals[k];
    score += (base + secondaryBonus(base)) * (weights[k] ?? 1);
  }
  return score;
}

function add(a: Record<StatKey, number>, b: Record<StatKey, number>): Record<StatKey, number> {
  const out = { ...a };
  (Object.keys(b) as StatKey[]).forEach(k => { out[k] = (out[k] || 0) + (b[k] || 0); });
  return out;
}

export type OptimizeOptions = {
  weights: StatWeights;
  enforceOneExotic?: boolean;
  preferSet?: string; // e.g., "Edge of Fate"
  perSlotLimit?: number; // limit items per slot considered (speed)
};

/**
 * Meet-in-the-middle optimizer: pick one piece per slot (Helmet/Gauntlets/Chest/Legs/Class Item).
 * Applies optional set bonuses.
 */
export function optimize(armor: ArmorItem[], opts: OptimizeOptions): Loadout | null {
  const slots = ['Helmet','Gauntlets','Chest','Legs','Class Item'];
  const bySlot: Record<string, ArmorItem[]> = Object.fromEntries(slots.map(s => [s, [] as ArmorItem[]]));
  armor.forEach(a => {
    if (bySlot[a.slot]) bySlot[a.slot].push(a);
  });

  // Limit per-slot candidates by preliminary stat score (sum of weighted primary stats, ignoring secondary bonus)
  const prelim = (it: ArmorItem) => {
    const w = opts.weights;
    let s = 0;
    (Object.keys(w) as StatKey[]).forEach(k => { s += (it.stats[k] || 0) * (w[k] || 1); });
    return s + (it.isExotic ? 0.1 : 0); // tiny tiebreaker to keep consistent ordering
  };
  const LIMIT = Math.max(10, opts.perSlotLimit ?? 30);
  slots.forEach(s => bySlot[s].sort((a,b) => prelim(b) - prelim(a)).splice(LIMIT));

  const helmets = bySlot['Helmet']; const gauntlets = bySlot['Gauntlets'];
  const chests = bySlot['Chest']; const legs = bySlot['Legs']; const classItems = bySlot['Class Item'];

  if (!helmets.length || !gauntlets.length || !chests.length || !legs.length || !classItems.length) return null;

  let best: Loadout | null = null;

  for (const h of helmets) for (const g of gauntlets) for (const c of chests) for (const l of legs) for (const ci of classItems) {
    const items = [h,g,c,l,ci];
    if (opts.enforceOneExotic) {
      const exoticCount = items.filter(i => i.isExotic).length;
      if (exoticCount > 1) continue;
    }

    // Totals
    let totals: Record<StatKey, number> = { weapons:0, health:0, class:0, grenade:0, super:0, melee:0 };
    items.forEach(it => { totals = add(totals, it.stats); });

    // Set bonuses (basic model): count pieces that share preferSet substring
    const notes: string[] = [];
    if (opts.preferSet) {
      const inSet = items.filter(i => (i.setName || '').toLowerCase().includes(opts.preferSet!.toLowerCase())).length;
      const bonus = SET_BONUSES[Object.keys(SET_BONUSES).find(k => opts.preferSet && k.toLowerCase() in ( { [opts.preferSet.toLowerCase()]: true } ) ) || ''] 
                 || SET_BONUSES['Edge of Fate']; // default example
      if (inSet >= 2 && bonus?.two) { totals = add(totals, bonus.two as any); notes.push('2-piece set bonus applied'); }
      if (inSet >= 4 && bonus?.four) { totals = add(totals, bonus.four as any); notes.push('4-piece set bonus applied'); }
    }

    const score = scoreTotals(totals, opts.weights);
    if (!best || score > best.score) {
      best = { items, totals, score, notes };
    }
  }

  return best;
}
