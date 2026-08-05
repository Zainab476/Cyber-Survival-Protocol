import { motion } from "framer-motion";
import { NeonButton } from "./NeonButton";
import { useGameStore } from "@/game/state/gameStore";
import { useT } from "@/game/i18n";

interface Props {
  onRestart: () => void;
  onQuit: () => void;
}

/** Pause overlay (ESC / P or the touch button). */
export function PauseMenu({ onRestart, onQuit }: Props) {
  const setPhase = useGameStore((s) => s.setPhase);
  const t = useT();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass scanlines w-full max-w-sm rounded-3xl p-8 text-center"
      >
        <h2 className="font-display neon-text mb-8 text-xl tracking-[0.25em]">{t("paused")}</h2>
        <div className="flex flex-col gap-3">
          <NeonButton variant="primary" full onClick={() => setPhase("playing")}>
            {t("resume")}
          </NeonButton>
          <NeonButton full onClick={onRestart}>
            {t("restart")}
          </NeonButton>
          <NeonButton variant="danger" full onClick={onQuit}>
            {t("quit")}
          </NeonButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
