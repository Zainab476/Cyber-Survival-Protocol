import { motion } from "framer-motion";
import { NeonButton } from "./NeonButton";
import { useGameStore } from "@/game/state/gameStore";
import { useT } from "@/game/i18n";

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/** End-of-run summary with animated score reveal. */
export function GameOverScreen({ onRestart, onQuit }: { onRestart: () => void; onQuit: () => void }) {
  const result = useGameStore((s) => s.result);
  const t = useT();
  if (!result) return null;

  const rows: [string, string][] = [
    [t("score"), result.score.toLocaleString()],
    [t("time"), formatTime(result.time)],
    [t("level"), String(result.level)],
    [t("kills"), String(result.kills)],
    [t("coins"), String(result.coins)],
    [t("bosses"), String(result.bosses)],
    [t("damage"), Math.round(result.damage).toLocaleString()],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/85 p-4 backdrop-blur-lg"
    >
      <motion.div
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 110, damping: 14 }}
        className="glass scanlines w-full max-w-md rounded-3xl p-8"
      >
        <h2
          className={`font-display mb-6 text-center text-2xl font-black tracking-[0.2em] ${
            result.victory ? "gradient-text" : "text-destructive"
          }`}
        >
          {result.victory ? t("victory") : t("gameOver")}
        </h2>

        <div className="mb-8 space-y-2">
          {rows.map(([label, value], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="border-border/60 flex items-center justify-between border-b pb-1 text-sm"
            >
              <span className="text-muted-foreground tracking-widest uppercase">{label}</span>
              <span className="font-display text-neon-cyan font-bold">{value}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <NeonButton variant="primary" full onClick={onRestart}>
            {t("playAgain")}
          </NeonButton>
          <NeonButton full onClick={onQuit}>
            {t("mainMenu")}
          </NeonButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
