import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TankId } from "@/types/aqualoop";

export function TankVisual({
  tankId,
  level,
  size = "md",
  label,
}: {
  tankId: TankId;
  level: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const heights = { sm: "h-32", md: "h-52", lg: "h-72" };
  const gradient = tankId === "rainwater" ? "var(--gradient-water)" : "var(--gradient-reject)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "relative w-full max-w-[190px] overflow-hidden rounded-[1.75rem] border-2 border-border bg-muted/40",
          heights[size],
        )}
      >
        <motion.div
          className="absolute inset-x-0 bottom-0"
          style={{ backgroundImage: gradient }}
          initial={false}
          animate={{ height: `${Math.max(2, Math.min(100, level))}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 14 }}
        >
          <motion.div
            className="absolute -top-3 left-0 h-6 w-[200%] rounded-[50%] bg-card/40"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -top-2 left-0 h-5 w-[200%] rounded-[50%] bg-card/25"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-card/60"
            style={{ left: `${18 + i * 20}%` }}
            animate={{ bottom: ["6%", `${Math.max(10, level - 6)}%`], opacity: [0, 0.9, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.6 }}
          />
        ))}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-background/70 px-3 py-1 font-display text-lg font-bold backdrop-blur">
            {Math.round(level)}%
          </span>
        </div>

        {[25, 50, 75].map((m) => (
          <span
            key={m}
            className="pointer-events-none absolute left-0 w-4 border-t border-border/70"
            style={{ bottom: `${m}%` }}
          />
        ))}
      </div>
      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
    </div>
  );
}
