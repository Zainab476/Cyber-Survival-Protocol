import { motion } from "framer-motion";
import { useGameStore } from "@/game/state/gameStore";
import { useT } from "@/game/i18n";
import type { Rarity, UpgradeCard } from "@/game/types";
import { sfx } from "@/game/audio/audioEngine";

const RARITY_STYLE: Record<Rarity, { ring: string; text: string; label: string }> = {
  common: { ring: "border-rarity-common/50", text: "text-rarity-common", label: "COMMON" },
  rare: { ring: "border-rarity-rare/70", text: "text-rarity-rare", label: "RARE" },
  epic: { ring: "border-rarity-epic/80", text: "text-rarity-epic", label: "EPIC" },
  legendary: {
    ring: "border-rarity-legendary shadow-[0_0_40px_-6px_var(--rarity-legendary)]",
    text: "text-rarity-legendary",
    label: "LEGENDARY",
  },
};

/** Level-up card picker with a 3D flip-in reveal. */
export function UpgradeModal() {
  const choices = useGameStore((s) => s.choices);
  const choose = useGameStore((s) => s.chooseUpgrade);
  const t = useT();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-background/80 p-4 backdrop-blur-md"
    >
      <motion.h2
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-display gradient-text text-3xl font-black tracking-[0.25em] sm:text-5xl"
      >
        {t("levelUp")}
      </motion.h2>
      <p className="text-muted-foreground text-sm tracking-widest uppercase">
        {t("chooseUpgrade")}
      </p>

      <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {choices.map((card: UpgradeCard, i) => {
          const style = RARITY_STYLE[card.rarity];
          return (
            <motion.button
              key={card.id}
              initial={{ rotateY: 90, opacity: 0, y: 30 }}
              animate={{ rotateY: 0, opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 120, damping: 14 }}
              whileHover={{ y: -8, scale: 1.03 }}
              onHoverStart={() => sfx.hover()}
              onClick={() => {
                sfx.click();
                choose(card);
              }}
              className={`glass scanlines flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center ${style.ring}`}
            >
              <span className={`text-4xl ${style.text}`}>{card.icon}</span>
              <span className={`font-display text-[10px] tracking-[0.3em] ${style.text}`}>
                {style.label}
              </span>
              <h3 className="font-display text-base font-bold">{card.title}</h3>
              <p className="text-muted-foreground text-sm">{card.description}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
