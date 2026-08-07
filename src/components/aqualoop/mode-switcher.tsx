import { motion } from "framer-motion";
import { Hand, Handshake, Bot } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation";
import type { OperatingMode } from "@/types/aqualoop";
import { cn } from "@/lib/utils";

const modes: { id: OperatingMode; label: string; icon: typeof Hand; hint: string }[] = [
  { id: "manual", label: "Manual", icon: Hand, hint: "You pick the destination" },
  { id: "assisted", label: "Assisted", icon: Handshake, hint: "Suggests, you confirm" },
  { id: "autonomous", label: "Autonomous", icon: Bot, hint: "Routes automatically" },
];

export function ModeSwitcher({ full = false }: { full?: boolean }) {
  const { mode, setMode } = useSimulation();
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-2xl border border-border bg-card/70 p-1.5 backdrop-blur",
        full && "justify-center",
      )}
    >
      {modes.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "relative flex-1 min-w-[80px] max-w-[140px] rounded-xl px-3 py-2 text-left transition-colors shrink-0",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            style={{ flexBasis: full ? "calc(33.333% - 16px)" : "auto" }}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                className="gradient-brand absolute inset-0 rounded-xl"
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              <m.icon className="h-4 w-4 shrink-0" />
              <span className="truncate text-sm font-medium">{m.label}</span>
            </span>
            {full && (
              <span className="relative mt-0.5 block text-center text-[11px] opacity-80">
                {m.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
