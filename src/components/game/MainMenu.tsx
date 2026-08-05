import { AnimatePresence, motion } from "framer-motion";
import { NeonButton } from "./NeonButton";
import {
  SettingsPanel,
  AchievementsPanel,
  StatsPanel,
  LeaderboardPanel,
  CreditsPanel,
} from "./MenuPanels";
import { useMenuScreen, useT } from "@/game/i18n";
import { useMetaStore } from "@/game/state/metaStore";

/** Landing screen: title, primary actions and animated sub-panels. */
export function MainMenu({ onPlay }: { onPlay: () => void }) {
  const t = useT();
  const { screen, go } = useMenuScreen();
  const lang = useMetaStore((s) => s.settings.language);
  const stats = useMetaStore((s) => s.stats);

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="grid-bg absolute inset-0 z-30 flex items-center justify-center overflow-y-auto p-4"
    >
      <AnimatePresence mode="wait">
        {screen === "root" && (
          <motion.div
            key="root"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-md text-center"
          >
            <motion.p
              initial={{ letterSpacing: "0.6em", opacity: 0 }}
              animate={{ letterSpacing: "0.3em", opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="font-display text-neon-violet mb-1 text-xs"
            >
              {t("subtitle")}
            </motion.p>
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-display gradient-text pulse-glow mb-2 rounded-2xl py-3 text-4xl font-black sm:text-6xl"
            >
              {t("title")}
            </motion.h1>
            <p className="text-muted-foreground mb-8 text-sm">{t("howto")}</p>

            <div className="flex flex-col gap-3">
              <NeonButton variant="primary" full onClick={onPlay} className="py-4 text-base">
                ▶ {t("play")}
              </NeonButton>
              <div className="grid grid-cols-2 gap-3">
                <NeonButton onClick={() => go("settings")}>{t("settings")}</NeonButton>
                <NeonButton onClick={() => go("achievements")}>{t("achievements")}</NeonButton>
                <NeonButton onClick={() => go("leaderboard")}>{t("leaderboard")}</NeonButton>
                <NeonButton onClick={() => go("stats")}>{t("stats")}</NeonButton>
              </div>
              <NeonButton full onClick={() => go("credits")}>
                {t("credits")}
              </NeonButton>
            </div>

            <p className="text-muted-foreground mt-8 text-xs tracking-widest uppercase">
              {t("score")}: {stats.highScore.toLocaleString()} · {t("kills")}:{" "}
              {stats.enemiesKilled.toLocaleString()}
            </p>
          </motion.div>
        )}

        {screen === "settings" && <SettingsPanel key="settings" />}
        {screen === "achievements" && <AchievementsPanel key="ach" />}
        {screen === "stats" && <StatsPanel key="stats" />}
        {screen === "leaderboard" && <LeaderboardPanel key="lb" />}
        {screen === "credits" && <CreditsPanel key="credits" />}
      </AnimatePresence>
    </div>
  );
}
