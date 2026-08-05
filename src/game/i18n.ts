import { create } from "zustand";
import { useMetaStore } from "./state/metaStore";

/** Minimal localisation layer (English / Arabic) — no runtime dependency. */
const DICT = {
  en: {
    title: "CYBER SURVIVOR",
    subtitle: "ROGUE PROTOCOL",
    play: "Play",
    settings: "Settings",
    achievements: "Achievements",
    leaderboard: "Leaderboard",
    credits: "Credits",
    stats: "Statistics",
    resume: "Resume",
    restart: "Restart",
    quit: "Quit to menu",
    paused: "SIMULATION PAUSED",
    levelUp: "LEVEL UP",
    chooseUpgrade: "Choose an upgrade protocol",
    gameOver: "SIGNAL LOST",
    victory: "PROTOCOL PURGED",
    score: "Score",
    time: "Time",
    kills: "Kills",
    level: "Level",
    coins: "Coins",
    bosses: "Bosses",
    damage: "Damage",
    playAgain: "Run again",
    mainMenu: "Main menu",
    difficulty: "Difficulty",
    music: "Music",
    sfx: "Sound effects",
    mute: "Mute all",
    shake: "Screen shake",
    fps: "Show FPS",
    language: "Language",
    back: "Back",
    locked: "Locked",
    arsenal: "Arsenal",
    reset: "Reset progress",
    howto: "WASD / Arrows to move — weapons fire automatically",
  },
  ar: {
    title: "الناجي السيبراني",
    subtitle: "بروتوكول متمرد",
    play: "العب",
    settings: "الإعدادات",
    achievements: "الإنجازات",
    leaderboard: "المتصدرون",
    credits: "الفريق",
    stats: "الإحصائيات",
    resume: "استئناف",
    restart: "إعادة",
    quit: "الخروج للقائمة",
    paused: "تم إيقاف المحاكاة",
    levelUp: "ارتقاء المستوى",
    chooseUpgrade: "اختر بروتوكول التطوير",
    gameOver: "فقد الاتصال",
    victory: "تم تطهير البروتوكول",
    score: "النقاط",
    time: "الوقت",
    kills: "القتلى",
    level: "المستوى",
    coins: "العملات",
    bosses: "الزعماء",
    damage: "الضرر",
    playAgain: "جولة أخرى",
    mainMenu: "القائمة الرئيسية",
    difficulty: "الصعوبة",
    music: "الموسيقى",
    sfx: "المؤثرات",
    mute: "كتم الصوت",
    shake: "اهتزاز الشاشة",
    fps: "عرض الإطارات",
    language: "اللغة",
    back: "رجوع",
    locked: "مقفل",
    arsenal: "الترسانة",
    reset: "إعادة التقدم",
    howto: "تحرك بالأسهم أو WASD — الأسلحة تطلق تلقائياً",
  },
} as const;

export type TKey = keyof (typeof DICT)["en"];

export function useT() {
  const lang = useMetaStore((s) => s.settings.language);
  return (key: TKey) => DICT[lang][key] ?? DICT.en[key];
}

/** Simple screen router for the shell (menu sub-screens). */
export type MenuScreen = "root" | "settings" | "achievements" | "leaderboard" | "credits" | "stats";

export const useMenuScreen = create<{ screen: MenuScreen; go: (s: MenuScreen) => void }>((set) => ({
  screen: "root",
  go: (screen) => set({ screen }),
}));
