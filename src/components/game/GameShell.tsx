import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GameCanvas } from "./GameCanvas";
import { HUD } from "./HUD";
import { MainMenu } from "./MainMenu";
import { UpgradeModal } from "./UpgradeModal";
import { PauseMenu } from "./PauseMenu";
import { GameOverScreen } from "./GameOverScreen";
import { TouchControls } from "./TouchControls";
import { GameToast } from "./GameToast";
import { useGameStore } from "@/game/state/gameStore";
import { useMetaStore } from "@/game/state/metaStore";
import { applyVolumes, playMusic, stopMusic, unlockAudio } from "@/game/audio/audioEngine";
import { useMenuScreen } from "@/game/i18n";
import { useIsTouch } from "@/hooks/useIsTouch";

/**
 * Top-level orchestrator: owns run lifecycle, mounts the Phaser canvas only while
 * a run is active and layers every React overlay on top of it.
 */
export function GameShell() {
  const phase = useGameStore((s) => s.phase);
  const reset = useGameStore((s) => s.reset);
  const setPhase = useGameStore((s) => s.setPhase);
  const goMenu = useMenuScreen((s) => s.go);
  const settings = useMetaStore((s) => s.settings);
  const isTouch = useIsTouch();
  const [runId, setRunId] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => applyVolumes(), [settings.musicVolume, settings.muted]);

  useEffect(() => {
    if (phase === "menu") playMusic("menu");
    return () => {
      if (phase === "menu") stopMusic();
    };
  }, [phase]);

  const startRun = useCallback(() => {
    unlockAudio();
    setLoading(true);
    setRunId((id) => id + 1);
    window.setTimeout(() => {
      setLoading(false);
      setPhase("playing");
      playMusic("battle");
    }, 900);
  }, [setPhase]);

  const quit = useCallback(() => {
    reset();
    goMenu("root");
    stopMusic();
    playMusic("menu");
  }, [reset, goMenu]);

  const inRun = phase !== "menu";

  return (
    <main
      className="bg-background relative h-[100dvh] w-full overflow-hidden select-none"
      dir={settings.language === "ar" ? "rtl" : "ltr"}
    >
      {inRun && <GameCanvas runId={runId} />}
      {phase === "playing" && (
        <>
          <HUD />
          {isTouch && <TouchControls />}
        </>
      )}
      {phase === "paused" && <HUD />}
      <GameToast />

      <AnimatePresence mode="wait">
        {phase === "menu" && !loading && <MainMenu key="menu" onPlay={startRun} />}
        {phase === "levelup" && <UpgradeModal key="levelup" />}
        {phase === "paused" && (
          <PauseMenu key="pause" onRestart={startRun} onQuit={quit} />
        )}
        {phase === "gameover" && (
          <GameOverScreen key="over" onRestart={startRun} onQuit={quit} />
        )}
      </AnimatePresence>

      {/* Loading / boot sequence */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background absolute inset-0 z-50 grid place-items-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                className="border-neon-cyan/30 border-t-neon-cyan mx-auto mb-6 size-16 rounded-full border-4"
              />
              <p className="font-display neon-text text-xs tracking-[0.4em]">
                INITIALISING PROTOCOL…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
