import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { sfx } from "@/game/audio/audioEngine";

type Variant = "primary" | "ghost" | "danger";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  full?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(120deg,var(--neon-cyan),var(--neon-violet))] text-primary-foreground shadow-[var(--shadow-neon)]",
  ghost: "glass text-foreground hover:border-neon-cyan/70",
  danger:
    "bg-[linear-gradient(120deg,var(--destructive),var(--neon-pink))] text-destructive-foreground",
};

/** Shared cyberpunk button with hover glow + click sound. */
export function NeonButton({
  variant = "ghost",
  full,
  className,
  children,
  onClick,
  ...props
}: NeonButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => sfx.hover()}
      onClick={(e) => {
        sfx.click();
        onClick?.(e);
      }}
      className={cn(
        "font-display relative rounded-xl px-6 py-3 text-sm font-bold tracking-widest uppercase transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        VARIANTS[variant],
        full && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
