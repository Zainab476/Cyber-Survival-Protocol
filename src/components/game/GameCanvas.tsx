import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { BootScene } from "@/game/scenes/BootScene";
import { MainScene } from "@/game/scenes/MainScene";

/**
 * Mounts the Phaser instance and keeps it isolated from React re-renders.
 * `runId` changes force a full teardown + fresh run.
 */
export function GameCanvas({ runId }: { runId: number }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      backgroundColor: "#05060f",
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: "100%",
        height: "100%",
      },
      render: { antialias: true, powerPreference: "high-performance" },
      scene: [BootScene, MainScene],
      fps: { target: 60 },
    });

    return () => {
      game.destroy(true);
    };
  }, [runId]);

  return <div ref={hostRef} className="absolute inset-0" aria-label="Game viewport" />;
}
