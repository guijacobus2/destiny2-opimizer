export type StatKey = 'weapons' | 'health' | 'class' | 'grenade' | 'super' | 'melee'

export type ArmorItem = {
  itemInstanceId?: string;
  itemHash: number;
  name: string;
  icon?: string;
  slot: 'Helmet' | 'Gauntlets' | 'Chest' | 'Legs' | 'Class Item' | 'Unknown';
  isExotic: boolean;
  setName?: string;
  stats: Record<StatKey, number>;
  rawStats: Record<string, number>;
}

export type Loadout = {
  items: ArmorItem[];
  totals: Record<StatKey, number>;
  score: number;
  notes?: string[];
}
