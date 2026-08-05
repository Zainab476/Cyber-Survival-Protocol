import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// Phaser touches window/canvas at import time, so the shell is client-only.
const GameShell = lazy(() =>
  import("@/components/game/GameShell").then((m) => ({ default: m.GameShell })),
);

const TITLE = "Cyber Survivor: Rogue Protocol — Neon Roguelite Shooter";
const DESCRIPTION =
  "Survive an AI-controlled cyber city in a fast-paced browser roguelite: auto-firing weapons, level-up upgrade cards, bosses every five minutes and neon carnage.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
  ssr: false,
});

function Index() {
  return (
    <Suspense
      fallback={
        <div className="bg-background grid h-[100dvh] place-items-center">
          <p className="font-display neon-text text-xs tracking-[0.4em]">BOOTING…</p>
        </div>
      }
    >
      <h1 className="sr-only">Cyber Survivor: Rogue Protocol</h1>
      <GameShell />
    </Suspense>
  );
}
