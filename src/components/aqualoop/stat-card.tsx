import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  tone = "default",
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
  delay?: number;
}) {
  const toneClass = {
    default: "text-primary bg-primary/10",
    good: "text-success bg-success/10",
    warn: "text-warning bg-warning/15",
    bad: "text-destructive bg-destructive/10",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="card-soft p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold">
            {value}
            {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
          </p>
        </div>
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", toneClass)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}
