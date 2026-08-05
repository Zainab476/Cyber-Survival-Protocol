import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useGameStore } from "@/game/state/gameStore";

/** Transient in-game notification (boss warnings, achievements). */
export function GameToast() {
  const toast = useGameStore((s) => s.toast);
  const clear = useGameStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(clear, 2800);
    return () => window.clearTimeout(id);
  }, [toast, clear]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="glass neon-border pointer-events-none absolute top-32 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3"
        >
          <span className="text-neon-cyan text-2xl">{toast.icon}</span>
          <div>
            <p className="font-display text-neon-cyan text-[10px] tracking-[0.3em]">
              {toast.title}
            </p>
            <p className="text-sm">{toast.text}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
