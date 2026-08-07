import { motion } from "framer-motion";
import {
  Droplet,
  Thermometer,
  FlaskConical,
  Gauge,
  Waves,
  Activity,
  ShieldAlert,
  BatteryMedium,
  Wifi,
} from "lucide-react";
import type { TankState } from "@/types/aqualoop";
import { RANGES } from "@/lib/simulation";
import { cn } from "@/lib/utils";

type Tone = "good" | "warn" | "bad";

function toneOf(value: number, [min, max]: [number, number], warnAt = 0.75, badAt = 0.9): Tone {
  const ratio = (value - min) / Math.max(max - min, 0.001);
  if (ratio >= badAt) return "bad";
  if (ratio >= warnAt) return "warn";
  return "good";
}

const toneStyles: Record<Tone, string> = {
  good: "text-success",
  warn: "text-warning",
  bad: "text-destructive",
};

export function SensorGrid({ tank }: { tank: TankState }) {
  const r = RANGES[tank.id];
  const phTone: Tone = tank.ph < 6.4 || tank.ph > 8.3 ? "bad" : tank.ph < 6.8 ? "warn" : "good";

  const cells = [
    {
      icon: Droplet,
      label: "Water Level",
      value: `${tank.waterLevel}%`,
      tone: tank.waterLevel < 15 ? "bad" : tank.waterLevel > 95 ? "warn" : "good",
    },
    {
      icon: Thermometer,
      label: "Temperature",
      value: `${tank.temperature} °C`,
      tone: toneOf(tank.temperature, r.temperature),
    },
    { icon: FlaskConical, label: "pH", value: tank.ph.toFixed(2), tone: phTone },
    {
      icon: Gauge,
      label: "TDS",
      value: `${tank.tds} ppm`,
      tone: toneOf(tank.tds, r.tds, 0.6, 0.8),
    },
    {
      icon: Waves,
      label: "Turbidity",
      value: `${tank.turbidity} NTU`,
      tone: toneOf(tank.turbidity, r.turbidity, 0.55, 0.8),
    },
    {
      icon: Activity,
      label: "Flow Rate",
      value: `${tank.flowRate} L/min`,
      tone: "good" as Tone,
    },
    {
      icon: ShieldAlert,
      label: "Leak Detection",
      value: tank.leak ? "Leak found" : "No leak",
      tone: tank.leak ? "bad" : "good",
    },
    {
      icon: BatteryMedium,
      label: "Battery",
      value: `${tank.battery}%`,
      tone: tank.battery < 25 ? "bad" : tank.battery < 45 ? "warn" : "good",
    },
    {
      icon: Wifi,
      label: "WiFi Signal",
      value: `${tank.wifi} dBm`,
      tone: tank.wifi < -78 ? "bad" : tank.wifi < -65 ? "warn" : "good",
    },
  ] as { icon: typeof Droplet; label: string; value: string; tone: Tone }[];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {cells.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          className="card-soft p-4"
        >
          <div className="flex items-center gap-2">
            <c.icon className={cn("h-4 w-4 shrink-0", toneStyles[c.tone])} />
            <span className="truncate text-xs font-medium text-muted-foreground">{c.label}</span>
            <motion.span
              className={cn(
                "ml-auto h-2 w-2 shrink-0 rounded-full",
                c.tone === "good"
                  ? "bg-success"
                  : c.tone === "warn"
                    ? "bg-warning"
                    : "bg-destructive",
              )}
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <motion.p
            key={c.value}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 font-display text-lg font-bold"
          >
            {c.value}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}
