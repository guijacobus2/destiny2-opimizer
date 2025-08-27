export type DestinyMembership = {
  membershipId: string;
  membershipType: number; // 1 Xbox, 2 PSN, 3 Steam, 4 Blizzard, 5 Stadia, 6 Epic, 254 BungieNext
};

export type D2Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch ms
  membership?: DestinyMembership;
};

export type StatKey = 'weapons' | 'health' | 'class' | 'grenade' | 'super' | 'melee';

export type StatWeights = Record<StatKey, number>;

export type ArmorItem = {
  itemInstanceId?: string;
  itemHash: number;
  name: string;
  icon?: string; // full URL
  slot: 'Helmet' | 'Gauntlets' | 'Chest' | 'Legs' | 'Class Item' | 'Unknown';
  isExotic: boolean;
  setName?: string; // for set bonuses
  stats: Record<StatKey, number>;
  rawStats: Record<string, number>;
};

export type Loadout = {
  items: ArmorItem[]; // 5 pieces
  totals: Record<StatKey, number>;
  score: number;
  notes?: string[];
};
