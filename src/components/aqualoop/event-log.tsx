import { AnimatePresence, motion } from "framer-motion";
import { Activity, Sparkles, Route, Bell, Cpu, Droplets } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation";
import { formatAgo } from "@/lib/simulation";
import type { EventType } from "@/types/aqualoop";

const icons: Record<EventType, typeof Activity> = {
  recommendation: Sparkles,
  sensor: Activity,
  routing: Route,
  alert: Bell,
  device: Cpu,
  quality: Droplets,
};

export function EventLog({
  limit = 8,
  title = "Live Event Log",
}: {
  limit?: number;
  title?: string;
}) {
  const { events, now } = useSimulation();
  const shown = events.slice(0, limit);

  return (
    <section className="card-soft p-5">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">Streaming from the simulation engine</p>
      <div className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {shown.map((e) => {
            const Icon = icons[e.type];
            return (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <p className="min-w-0 text-sm">{e.message}</p>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatAgo(e.createdAt, now)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {shown.length === 0 && (
          <p className="text-sm text-muted-foreground">Waiting for the first telemetry cycle…</p>
        )}
      </div>
    </section>
  );
}
