import { motion } from "framer-motion";
import { NeonButton } from "./NeonButton";
import { useMetaStore } from "@/game/state/metaStore";
import { ACHIEVEMENTS } from "@/game/config/achievements";
import { WEAPON_LIST } from "@/game/config/weapons";
import { useT, useMenuScreen } from "@/game/i18n";
import type { Difficulty } from "@/game/types";
import { Lock } from "lucide-react";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useT();
  const go = useMenuScreen((s) => s.go);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="glass scanlines max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 sm:p-8"
    >
      <h2 className="font-display gradient-text mb-6 text-xl tracking-[0.25em]">{title}</h2>
      {children}
      <div className="mt-8">
        <NeonButton full onClick={() => go("root")}>
          {t("back")}
        </NeonButton>
      </div>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border/60 flex items-center justify-between gap-4 border-b py-3">
      <span className="text-muted-foreground text-sm tracking-widest uppercase">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export function SettingsPanel() {
  const t = useT();
  const { settings, updateSettings, resetProgress } = useMetaStore();
  const diffs: Difficulty[] = ["recruit", "operative", "nightmare"];

  return (
    <Panel title={t("settings")}>
      <Row label={t("music")}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.musicVolume}
          onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
          className="accent-neon-cyan w-40"
        />
      </Row>
      <Row label={t("sfx")}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.sfxVolume}
          onChange={(e) => updateSettings({ sfxVolume: Number(e.target.value) })}
          className="accent-neon-cyan w-40"
        />
      </Row>
      <Row label={t("mute")}>
        <NeonButton
          variant={settings.muted ? "danger" : "ghost"}
          className="px-4 py-1.5 text-xs"
          onClick={() => updateSettings({ muted: !settings.muted })}
        >
          {settings.muted ? "OFF" : "ON"}
        </NeonButton>
      </Row>
      <Row label={t("shake")}>
        <NeonButton
          variant={settings.screenShake ? "primary" : "ghost"}
          className="px-4 py-1.5 text-xs"
          onClick={() => updateSettings({ screenShake: !settings.screenShake })}
        >
          {settings.screenShake ? "ON" : "OFF"}
        </NeonButton>
      </Row>
      <Row label={t("fps")}>
        <NeonButton
          variant={settings.showFps ? "primary" : "ghost"}
          className="px-4 py-1.5 text-xs"
          onClick={() => updateSettings({ showFps: !settings.showFps })}
        >
          {settings.showFps ? "ON" : "OFF"}
        </NeonButton>
      </Row>
      <Row label={t("difficulty")}>
        {diffs.map((d) => (
          <NeonButton
            key={d}
            variant={settings.difficulty === d ? "primary" : "ghost"}
            className="px-3 py-1.5 text-[10px]"
            onClick={() => updateSettings({ difficulty: d })}
          >
            {d}
          </NeonButton>
        ))}
      </Row>
      <Row label={t("language")}>
        {(["en", "ar"] as const).map((l) => (
          <NeonButton
            key={l}
            variant={settings.language === l ? "primary" : "ghost"}
            className="px-3 py-1.5 text-[10px]"
            onClick={() => updateSettings({ language: l })}
          >
            {l.toUpperCase()}
          </NeonButton>
        ))}
      </Row>
      <div className="mt-6">
        <NeonButton variant="danger" full onClick={resetProgress}>
          {t("reset")}
        </NeonButton>
      </div>
    </Panel>
  );
}

export function AchievementsPanel() {
  const t = useT();
  const owned = useMetaStore((s) => s.achievements);
  return (
    <Panel title={t("achievements")}>
      <div className="grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = owned.includes(a.id);
          return (
            <motion.div
              key={a.id}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-3 rounded-2xl border p-4 ${
                unlocked ? "neon-border" : "border-border/60 opacity-50"
              }`}
            >
              <span className={`text-2xl ${unlocked ? "text-neon-cyan" : "text-muted-foreground"}`}>
                {unlocked ? a.icon : "🔒"}
              </span>
              <div>
                <p className="font-display text-sm">{a.name}</p>
                <p className="text-muted-foreground text-xs">{a.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Panel>
  );
}

export function StatsPanel() {
  const t = useT();
  const { stats, unlockedWeapons } = useMetaStore();
  const rows: [string, string][] = [
    ["Games played", String(stats.gamesPlayed)],
    ["Highest level", String(stats.highestLevel)],
    ["Longest survival", `${Math.floor(stats.longestSurvival / 60)}m ${Math.floor(stats.longestSurvival % 60)}s`],
    ["Enemies killed", stats.enemiesKilled.toLocaleString()],
    ["Bosses defeated", String(stats.bossesDefeated)],
    ["Coins collected", stats.coinsCollected.toLocaleString()],
    ["Damage dealt", Math.round(stats.damageDealt).toLocaleString()],
    ["High score", stats.highScore.toLocaleString()],
  ];
  return (
    <Panel title={t("stats")}>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="glass flex items-center justify-between rounded-xl px-4 py-3">
            <span className="text-muted-foreground text-xs tracking-widest uppercase">{k}</span>
            <span className="font-display text-neon-cyan text-sm">{v}</span>
          </div>
        ))}
      </div>

      <h3 className="font-display mt-8 mb-3 text-sm tracking-[0.25em]">{t("arsenal")}</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {WEAPON_LIST.map((w) => {
          const unlocked = unlockedWeapons.includes(w.id);
          return (
            <div
              key={w.id}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                unlocked ? "border-neon-cyan/40" : "border-border/60 opacity-55"
              }`}
            >
              <span className="text-neon-violet text-xl">{unlocked ? w.icon : <Lock className="size-4" />}</span>
              <div className="min-w-0">
                <p className="font-display truncate text-xs">{w.name}</p>
                <p className="text-muted-foreground truncate text-[11px]">
                  {unlocked ? w.special : `${t("locked")} — ${w.unlockAtKills} kills`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function LeaderboardPanel() {
  const t = useT();
  const stats = useMetaStore((s) => s.stats);
  const entries = [
    { name: "NEON_WRAITH", score: 184_500 },
    { name: "V0LT", score: 121_300 },
    { name: "GHOST//7", score: 88_400 },
    { name: "YOU", score: stats.highScore },
    { name: "R3NDER", score: 42_100 },
  ].sort((a, b) => b.score - a.score);

  return (
    <Panel title={t("leaderboard")}>
      <p className="text-muted-foreground mb-4 text-xs">
        Local records. Cloud sync is architecture-ready — the same store shape maps 1:1 to a hosted
        leaderboard table.
      </p>
      <div className="space-y-2">
        {entries.map((e, i) => (
          <motion.div
            key={e.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              e.name === "YOU" ? "neon-border" : "glass"
            }`}
          >
            <span className="font-display text-sm">
              <span className="text-muted-foreground mr-3">#{i + 1}</span>
              {e.name}
            </span>
            <span className="font-display text-neon-cyan text-sm">{e.score.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
}

export function CreditsPanel() {
  const t = useT();
  return (
    <Panel title={t("credits")}>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          <span className="neon-text font-display">Cyber Survivor: Rogue Protocol</span> — a
          browser roguelite survival shooter built as a portfolio showcase.
        </p>
        <ul className="text-muted-foreground space-y-1">
          <li>Engine — Phaser 3 (procedural sprites, zero binary assets)</li>
          <li>Shell — React 19 + TypeScript + Vite</li>
          <li>State — Zustand with persisted meta-progression</li>
          <li>UI — Tailwind CSS design tokens + Framer Motion</li>
          <li>Audio — procedural Web Audio synthesis</li>
          <li>Save — LocalStorage today, cloud-ready tomorrow</li>
        </ul>
      </div>
    </Panel>
  );
}
