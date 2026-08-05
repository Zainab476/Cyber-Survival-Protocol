import type { Achievement } from "../types";

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_kill", name: "First Blood", description: "Destroy your first machine.", icon: "◉" },
  { id: "kills_100", name: "Clean Sweep", description: "Destroy 100 enemies.", icon: "⌁" },
  { id: "kills_1000", name: "Machine Reaper", description: "Destroy 1000 enemies.", icon: "☠" },
  { id: "level_10", name: "Overclocked", description: "Reach level 10 in a run.", icon: "▲" },
  { id: "level_25", name: "Root Access", description: "Reach level 25 in a run.", icon: "⬢" },
  { id: "boss_slayer", name: "Firewall Breach", description: "Defeat a boss.", icon: "✷" },
  { id: "all_weapons", name: "Full Arsenal", description: "Unlock every weapon.", icon: "⚔" },
  { id: "survive_20", name: "Twenty Minute Ghost", description: "Survive 20 minutes.", icon: "⏱" },
];
