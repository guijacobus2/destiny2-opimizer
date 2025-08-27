import type { StatKey } from './types'

export const STAT_LABELS: Record<StatKey, string> = {
  weapons: 'Weapons',
  health: 'Health',
  class: 'Class',
  grenade: 'Grenade',
  super: 'Super',
  melee: 'Melee',
}

export const DEFAULT_WEIGHTS: Record<StatKey, number> = {
  weapons: 1,
  health: 1.2,
  class: 1,
  grenade: 0.8,
  super: 0.8,
  melee: 0.8,
}
