import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/game/state/gameStore";
import { useMetaStore } from "@/game/state/metaStore";
import { WEAPONS } from "@/game/config/weapons";
import { useT } from "@/game/i18n";
import { Heart, Zap, Coins, Crosshair, Timer, Shield } from "lucide-react";

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function Minimap({ blips }: { blips: { x: number; y: number; kind: string }[] }) {
  const R = 54;
  return (
    <div className="glass relative size-28 overflow-hidden rounded-full sm:size-32">
      <div className="grid-bg absolute inset-0 opacity-60" />
      {blips.map((b, i) => {
        const d = Math.hypot(b.x, b.y);
        const scale = Math.min(1, 900 / (d || 1));
        const x = (b.x * scale) / 900;
        const y = (b.y * scale) / 900;
        const boss = b.kind === "boss" || b.kind === "mini_boss";
        return (
          <span
            key={i}
            className={`absolute rounded-full ${boss ? "size-2 bg-neon-pink" : "size-1 bg-neon-cyan"}`}
            style={{ left: `calc(50% + ${x * R}px)`, top: `calc(50% + ${y * R}px)` }}
          />
        );
      })}
      <span className="bg-neon-lime absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_8px_var(--neon-lime)]" />
    </div>
  );
}

/** In-run heads-up display: bars, run stats, minimap and boss health. */
export function HUD() {
  const hud = useGameStore((s) => s.hud);
  const showFps = useMetaStore((s) => s.settings.showFps);
  const t = useT();
  const weapon = WEAPONS[hud.weapon];

  const hpPct = Math.max(0, (hud.health / hud.maxHealth) * 100);
  const xpPct = Math.min(100, (hud.xp / hud.xpNeeded) * 100);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="glass w-[min(52vw,380px)] rounded-2xl p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-display bg-neon-violet/25 text-neon-violet rounded-lg px-2 py-0.5 text-xs font-bold">
              LV {hud.level}
            </span>
            <span className="text-muted-foreground truncate text-xs tracking-widest uppercase">
              {weapon.icon} {weapon.name}
            </span>
          </div>

          <div className="hud-bar h-3">
            <motion.div
              className="h-full bg-[linear-gradient(90deg,var(--neon-lime),var(--warning))]"
              animate={{ width: `${hpPct}%` }}
              transition={{ duration: 0.2 }}
            />
            <span className="font-display absolute inset-0 flex items-center justify-center text-[10px]">
              {Math.ceil(hud.health)} / {Math.ceil(hud.maxHealth)}
            </span>
          </div>

          <div className="hud-bar mt-1.5 h-2">
            <motion.div
              className="bg-neon-cyan h-full"
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {hud.shield > 0 && (
            <div className="text-neon-blue mt-1.5 flex items-center gap-1 text-xs">
              <Shield className="size-3" /> {Math.ceil(hud.shield)}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <Minimap blips={hud.minimap} />
          {showFps && (
            <span className="glass text-muted-foreground rounded-lg px-2 py-0.5 text-[10px]">
              {hud.fps} FPS
            </span>
          )}
        </div>
      </div>

      {/* boss bar */}
      <AnimatePresence>
        {hud.bossHealth !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-auto w-[min(90vw,620px)]"
          >
            <p className="font-display text-neon-pink mb-1 text-center text-xs tracking-[0.3em]">
              {hud.bossName}
            </p>
            <div className="hud-bar h-4 border-neon-pink/60">
              <motion.div
                className="h-full bg-[linear-gradient(90deg,var(--destructive),var(--neon-pink))]"
                animate={{ width: `${(hud.bossHealth / hud.bossMaxHealth) * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* bottom row */}
      <div className="flex items-end justify-between gap-3">
        <div className="glass flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl px-4 py-2 text-sm">
          <span className="flex items-center gap-1.5">
            <Timer className="text-neon-cyan size-4" /> {formatTime(hud.time)}
          </span>
          <span className="flex items-center gap-1.5">
            <Crosshair className="text-neon-lime size-4" /> {hud.kills}
          </span>
          <span className="flex items-center gap-1.5">
            <Coins className="text-warning size-4" /> {hud.coins}
          </span>
          <span className="text-muted-foreground hidden items-center gap-1.5 sm:flex">
            <Zap className="text-neon-violet size-4" /> {t("level")} {hud.level}
          </span>
          <span className="text-muted-foreground hidden items-center gap-1.5 lg:flex">
            <Heart className="text-destructive size-4" /> {Math.ceil(hud.health)}
          </span>
        </div>
      </div>
    </div>
  );
}
