import type { PlayerStats, Rarity, UpgradeCard, WeaponId } from "../types";

const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 60,
  rare: 25,
  epic: 11,
  legendary: 4,
};

/** Full upgrade pool. Cards mutate the player's stat block in place. */
export const UPGRADES: UpgradeCard[] = [
  {
    id: "dmg",
    title: "Overclocked Rounds",
    description: "+20% damage",
    rarity: "common",
    icon: "✦",
    apply: (s) => (s.damage *= 1.2),
  },
  {
    id: "speed",
    title: "Servo Boosters",
    description: "+15% movement speed",
    rarity: "common",
    icon: "➶",
    apply: (s) => (s.moveSpeed *= 1.15),
  },
  {
    id: "firerate",
    title: "Coolant Injectors",
    description: "+25% fire rate",
    rarity: "common",
    icon: "⏵",
    apply: (s) => (s.attackSpeed *= 1.25),
  },
  {
    id: "hp",
    title: "Nano Plating",
    description: "+25 max health, fully patched",
    rarity: "common",
    icon: "✚",
    apply: (s) => {
      s.maxHealth += 25;
      s.health = Math.min(s.maxHealth, s.health + 25);
    },
  },
  {
    id: "armor",
    title: "Ablative Armor",
    description: "+3 armor (flat damage reduction)",
    rarity: "common",
    icon: "▤",
    apply: (s) => (s.armor += 3),
  },
  {
    id: "magnet",
    title: "Magnet Field",
    description: "+60 pickup radius",
    rarity: "common",
    icon: "◎",
    apply: (s) => (s.magnet += 60),
  },
  {
    id: "crit",
    title: "Targeting Matrix",
    description: "+8% critical chance",
    rarity: "rare",
    icon: "◈",
    apply: (s) => (s.critChance = Math.min(0.85, s.critChance + 0.08)),
  },
  {
    id: "critdmg",
    title: "Fracture Protocol",
    description: "+40% critical damage",
    rarity: "rare",
    icon: "✵",
    apply: (s) => (s.critDamage += 0.4),
  },
  {
    id: "regen",
    title: "Repair Nanites",
    description: "+1.2 HP regeneration per second",
    rarity: "rare",
    icon: "❥",
    apply: (s) => (s.regen += 1.2),
  },
  {
    id: "luck",
    title: "Lucky Daemon",
    description: "+10% luck (better upgrade rolls)",
    rarity: "rare",
    icon: "☘",
    apply: (s) => (s.luck = Math.min(0.9, s.luck + 0.1)),
  },
  {
    id: "double",
    title: "Double Shot",
    description: "+1 projectile per volley",
    rarity: "epic",
    icon: "⇉",
    apply: (s) => (s.projectiles += 1),
  },
  {
    id: "pierce",
    title: "Piercing Bullets",
    description: "Projectiles pierce +1 enemy",
    rarity: "epic",
    icon: "↠",
    apply: (s) => (s.pierce += 1),
  },
  {
    id: "shield",
    title: "Shield Generator",
    description: "+40 regenerating shield",
    rarity: "epic",
    icon: "⬡",
    apply: (s) => (s.shield += 40),
  },
  {
    id: "triple",
    title: "Triple Shot",
    description: "+2 projectiles per volley",
    rarity: "legendary",
    icon: "⇶",
    apply: (s) => (s.projectiles += 2),
  },
  {
    id: "drone",
    title: "Drone Companion",
    description: "Deploy an autonomous combat drone",
    rarity: "legendary",
    icon: "✧",
    apply: (s) => (s.drones += 1),
  },
  {
    id: "overload",
    title: "System Overload",
    description: "+40% damage and +20% fire rate",
    rarity: "legendary",
    icon: "⚡",
    apply: (s) => {
      s.damage *= 1.4;
      s.attackSpeed *= 1.2;
    },
  },
];

/** Weapon-granting cards are injected dynamically based on what the player already owns. */
export function weaponCard(id: WeaponId, name: string, special: string): UpgradeCard {
  return {
    id: `weapon_${id}`,
    title: name,
    description: `New weapon — ${special}`,
    rarity: "epic",
    icon: "⌖",
    grants: id,
    apply: () => {},
  };
}

/** Roll three distinct cards, biased toward higher rarity by the player's luck stat. */
export function rollUpgrades(
  stats: PlayerStats,
  extraPool: UpgradeCard[] = [],
  count = 3,
): UpgradeCard[] {
  const pool = [...UPGRADES, ...extraPool];
  const picks: UpgradeCard[] = [];
  const used = new Set<string>();

  while (picks.length < count && used.size < pool.length) {
    const weighted = pool
      .filter((c) => !used.has(c.id))
      .map((c) => {
        const base = RARITY_WEIGHT[c.rarity];
        const luckBoost = c.rarity === "common" ? 1 - stats.luck * 0.5 : 1 + stats.luck * 1.5;
        return { card: c, w: base * luckBoost };
      });
    const total = weighted.reduce((a, b) => a + b.w, 0);
    let r = Math.random() * total;
    for (const entry of weighted) {
      r -= entry.w;
      if (r <= 0) {
        used.add(entry.card.id);
        picks.push(entry.card);
        break;
      }
    }
  }
  return picks;
}
