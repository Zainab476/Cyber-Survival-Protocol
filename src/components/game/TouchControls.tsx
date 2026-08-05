import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Pause } from "lucide-react";
import { touchInput } from "@/game/scenes/MainScene";
import { useGameStore } from "@/game/state/gameStore";

/**
 * Virtual analog stick for touch devices. Writes a normalised vector into the
 * shared `touchInput` object that MainScene reads each frame.
 */
export function TouchControls() {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const setPhase = useGameStore((s) => s.setPhase);

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const max = rect.width / 2;
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    setKnob({ x: dx, y: dy });
    touchInput.x = dx / max;
    touchInput.y = dy / max;
  };

  const release = () => {
    setKnob({ x: 0, y: 0 });
    touchInput.x = 0;
    touchInput.y = 0;
  };

  return (
    <>
      <div
        ref={baseRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleMove(e);
        }}
        onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && handleMove(e)}
        onPointerUp={release}
        onPointerCancel={release}
        className="glass absolute bottom-6 left-6 z-30 size-32 touch-none rounded-full sm:size-36"
      >
        <div
          className="bg-neon-cyan/70 absolute top-1/2 left-1/2 size-12 rounded-full shadow-[0_0_20px_var(--neon-cyan)]"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>

      <button
        onClick={() => setPhase("paused")}
        aria-label="Pause"
        className="glass absolute right-5 bottom-8 z-30 grid size-14 place-items-center rounded-full"
      >
        <Pause className="text-neon-cyan size-6" />
      </button>
    </>
  );
}
