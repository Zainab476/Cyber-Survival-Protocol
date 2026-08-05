/**
 * Shared domain types for Cyber Survivor: Rogue Protocol.
 * Kept engine-agnostic so both React UI and Phaser scenes can consume them.
 */

export type GamePhase = "menu" | "loading" | "playing" | "paused" | "levelup" | "gameover";

export type Difficulty = "recruit" | "operative" | "nightmare";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export type WeaponId =
  | "pulse_rifle"
  | "laser_cannon"
  | "plasma_shotgun"
  | "rocket_launcher"
  | "energy_blade"
  | "lightning_orb"
  | "mini_drone"
  | "flamethrower";

export type EnemyKind =
  | "small_drone"
  | "heavy_robot"
  | "flying_eye"
  | "sniper_bot"
  | "fast_runner"
  | "exploding_robot"
  | "mini_boss"
  | "boss";

/** Mutable player stat block, mutated by upgrade cards during a run. */
export interface PlayerStats {
  health: number;
  maxHealth: number;
  armor: number;
  moveSpeed: number;
  attackSpeed: number; // multiplier
  damage: number; // multiplier
  critChance: number; // 0..1
  critDamage: number; // multiplier
  luck: number; // 0..1 shifts rarity rolls
  magnet: number; // pickup radius px
  regen: number; // hp per second
  projectiles: number; // extra projectiles per volley
  pierce: number;
  shield: number; // damage absorbed before hp
  drones: number;
}

export interface WeaponDef {
  id: WeaponId;
  name: string;
  description: string;
  icon: string;
  damage: number;
  cooldown: number; // ms
  range: number;
  speed: number;
  special: string;
  unlockAtKills: number;
}

export interface EnemyDef {
  kind: EnemyKind;
  name: string;
  health: number;
  speed: number;
  damage: number;
  xp: number;
  coins: number;
  radius: number;
  color: number;
}

export interface UpgradeCard {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  icon: string;
  apply: (stats: PlayerStats) => void;
  /** Optional weapon granted by this card. */
  grants?: WeaponId;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface RunStats {
  level: number;
  timeSurvived: number;
  kills: number;
  coins: number;
  bosses: number;
  damage: number;
}

export interface LifetimeStats {
  gamesPlayed: number;
  highestLevel: number;
  longestSurvival: number;
  enemiesKilled: number;
  bossesDefeated: number;
  coinsCollected: number;
  damageDealt: number;
  highScore: number;
}

export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  screenShake: boolean;
  showFps: boolean;
  language: "en" | "ar";
  difficulty: Difficulty;
}
