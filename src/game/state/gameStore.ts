import { create } from "zustand";
import type { GamePhase, UpgradeCard, WeaponId } from "../types";

/**
 * Volatile per-run store. The Phaser scene pushes HUD snapshots here every frame-ish,
 * and the React layer reads them. Commands flow the other way through `command`.
 */
export interface Hud {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  level: number;
  xp: number;
  xpNeeded: number;
  coins: number;
  kills: number;
  time: number;
  weapon: WeaponId;
  bossHealth: number | null;
  bossMaxHealth: number;
  bossName: string;
  fps: number;
  minimap: { x: number; y: number; kind: string }[];
  playerAngle: number;
}

interface RunResult {
  level: number;
  time: number;
  kills: number;
  coins: number;
  bosses: number;
  damage: number;
  score: number;
  victory: boolean;
}

interface GameState {
  phase: GamePhase;
  hud: Hud;
  choices: UpgradeCard[];
  result: RunResult | null;
  toast: { id: number; title: string; text: string; icon: string } | null;

  setPhase: (p: GamePhase) => void;
  setHud: (patch: Partial<Hud>) => void;
  offerUpgrades: (cards: UpgradeCard[]) => void;
  chooseUpgrade: (card: UpgradeCard) => void;
  endRun: (r: RunResult) => void;
  pushToast: (title: string, text: string, icon: string) => void;
  clearToast: () => void;
  reset: () => void;
}

const emptyHud: Hud = {
  health: 100,
  maxHealth: 100,
  shield: 0,
  maxShield: 0,
  level: 1,
  xp: 0,
  xpNeeded: 12,
  coins: 0,
  kills: 0,
  time: 0,
  weapon: "pulse_rifle",
  bossHealth: null,
  bossMaxHealth: 1,
  bossName: "",
  fps: 60,
  minimap: [],
  playerAngle: 0,
};

/** Callback registered by the active Phaser scene to receive the chosen upgrade. */
let upgradeHandler: ((card: UpgradeCard) => void) | null = null;
export function registerUpgradeHandler(fn: ((card: UpgradeCard) => void) | null) {
  upgradeHandler = fn;
}

export const useGameStore = create<GameState>((set) => ({
  phase: "menu",
  hud: emptyHud,
  choices: [],
  result: null,
  toast: null,

  setPhase: (p) => set({ phase: p }),
  setHud: (patch) => set((s) => ({ hud: { ...s.hud, ...patch } })),
  offerUpgrades: (cards) => set({ choices: cards, phase: "levelup" }),
  chooseUpgrade: (card) => {
    upgradeHandler?.(card);
    set({ choices: [], phase: "playing" });
  },
  endRun: (r) => set({ result: r, phase: "gameover" }),
  pushToast: (title, text, icon) => set({ toast: { id: Date.now(), title, text, icon } }),
  clearToast: () => set({ toast: null }),
  reset: () => set({ phase: "menu", hud: emptyHud, choices: [], result: null }),
}));
