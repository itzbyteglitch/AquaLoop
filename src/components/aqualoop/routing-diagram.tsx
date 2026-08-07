import { motion } from "framer-motion";
import { CloudRain, Recycle, Sprout, Toilet, Waves, Brush, PauseCircle } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation";
import type { Destination, TankId } from "@/types/aqualoop";
import { cn } from "@/lib/utils";

const destinationIcons: Record<Destination, typeof Sprout> = {
  Irrigation: Sprout,
  "Toilet Flushing": Toilet,
  "Groundwater Recharge": Waves,
  "Floor Cleaning": Brush,
  "Holding / No Use": PauseCircle,
};

const destinations = Object.keys(destinationIcons) as Destination[];

function Line({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-border">
      {active && (
        <motion.div
          className="absolute inset-y-0 w-1/3 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ x: ["-40%", "320%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}

export function RoutingDiagram() {
  const { tanks, routes, pendingRoutes, mode } = useSimulation();

  const row = (tankId: TankId, Icon: typeof CloudRain, label: string, color: string) => {
    const active = routes[tankId];
    const pending = pendingRoutes[tankId];
    return (
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <div className="flex w-28 shrink-0 items-center gap-2">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
            style={{ backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0 truncate text-xs font-medium">{label}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <Line active={Boolean(active) && tanks[tankId].flowRate > 0.5} color={color} />
          <div className="flex flex-wrap gap-1.5">
            {destinations.map((d) => {
              const DIcon = destinationIcons[d];
              const isActive = active === d;
              const isPending = !isActive && pending === d && mode !== "manual";
              return (
                <motion.span
                  key={d}
                  animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition-colors",
                    isActive
                      ? "border-transparent bg-primary text-primary-foreground"
                      : isPending
                        ? "border-dashed border-primary text-primary"
                        : "border-border text-muted-foreground",
                  )}
                >
                  <DIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">{d}</span>
                </motion.span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card-soft space-y-5 p-5">
      <div>
        <h3 className="text-base font-semibold">Water Routing Diagram</h3>
        <p className="text-sm text-muted-foreground">
          The two loops are physically isolated — streams never mix.
        </p>
      </div>
      {row("rainwater", CloudRain, "Rainwater", "oklch(0.58 0.14 232)")}
      <div className="h-px bg-border" />
      {row("roReject", Recycle, "RO Reject", "oklch(0.7 0.15 165)")}
    </div>
  );
}
