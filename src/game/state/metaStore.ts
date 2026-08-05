import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LifetimeStats, Settings, WeaponId } from "../types";
import { WEAPON_LIST } from "../config/weapons";

/**
 * Persisted meta-progression store.
 * Backed by localStorage today; the shape is intentionally serialisable so it can
 * be mirrored to Lovable Cloud (Supabase) rows later without touching consumers.
 */
interface MetaState {
  unlockedWeapons: WeaponId[];
  achievements: string[];
  stats: LifetimeStats;
  settings: Settings;
  unlockWeapon: (id: WeaponId) => void;
  grantAchievement: (id: string) => boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  recordRun: (run: {
    level: number;
    time: number;
    kills: number;
    coins: number;
    bosses: number;
    damage: number;
    score: number;
  }) => void;
  resetProgress: () => void;
}

const emptyStats: LifetimeStats = {
  gamesPlayed: 0,
  highestLevel: 0,
  longestSurvival: 0,
  enemiesKilled: 0,
  bossesDefeated: 0,
  coinsCollected: 0,
  damageDealt: 0,
  highScore: 0,
};

const defaultSettings: Settings = {
  musicVolume: 0.4,
  sfxVolume: 0.6,
  muted: false,
  screenShake: true,
  showFps: false,
  language: "en",
  difficulty: "operative",
};

export const useMetaStore = create<MetaState>()(
  persist(
    (set, get) => ({
      unlockedWeapons: ["pulse_rifle"],
      achievements: [],
      stats: emptyStats,
      settings: defaultSettings,

      unlockWeapon: (id) =>
        set((s) =>
          s.unlockedWeapons.includes(id)
            ? s
            : { unlockedWeapons: [...s.unlockedWeapons, id] },
        ),

      grantAchievement: (id) => {
        if (get().achievements.includes(id)) return false;
        set((s) => ({ achievements: [...s.achievements, id] }));
        return true;
      },

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      recordRun: (run) =>
        set((s) => ({
          stats: {
            gamesPlayed: s.stats.gamesPlayed + 1,
            highestLevel: Math.max(s.stats.highestLevel, run.level),
            longestSurvival: Math.max(s.stats.longestSurvival, run.time),
            enemiesKilled: s.stats.enemiesKilled + run.kills,
            bossesDefeated: s.stats.bossesDefeated + run.bosses,
            coinsCollected: s.stats.coinsCollected + run.coins,
            damageDealt: s.stats.damageDealt + run.damage,
            highScore: Math.max(s.stats.highScore, run.score),
          },
        })),

      resetProgress: () =>
        set({ unlockedWeapons: ["pulse_rifle"], achievements: [], stats: emptyStats }),
    }),
    { name: "cyber-survivor-meta-v1" },
  ),
);

/** Weapons whose lifetime-kill unlock requirement is now met. */
export function pendingWeaponUnlocks(kills: number, owned: WeaponId[]): WeaponId[] {
  return WEAPON_LIST.filter((w) => w.unlockAtKills > 0 && kills >= w.unlockAtKills)
    .map((w) => w.id)
    .filter((id) => !owned.includes(id));
}
