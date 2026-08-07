import { motion } from "framer-motion";
import { Cloud, CloudRain, CloudLightning, Sun, CloudDrizzle, Droplets } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation";

const icons = {
  Sunny: Sun,
  Cloudy: Cloud,
  "Light Rain": CloudDrizzle,
  "Heavy Rain": CloudRain,
  Thunderstorm: CloudLightning,
};

export function WeatherWidget() {
  const { weather } = useSimulation();
  const Icon = icons[weather.condition];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-soft overflow-hidden"
    >
      <div className="gradient-brand p-5 text-primary-foreground">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide opacity-85">Local conditions</p>
            <p className="mt-1 font-display text-2xl font-bold">{weather.temperature}°C</p>
            <p className="truncate text-sm opacity-90">{weather.condition}</p>
          </div>
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="shrink-0"
          >
            <Icon className="h-12 w-12" />
          </motion.span>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Droplets className="h-4 w-4" /> Rain chance today
          </span>
          <span className="font-semibold">{weather.rainChance}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Humidity</span>
          <span className="font-semibold">{weather.humidity}%</span>
        </div>
        <div className="grid grid-cols-5 gap-2 pt-1">
          {weather.forecast.map((f) => (
            <div key={f.day} className="rounded-xl bg-muted/60 p-2 text-center">
              <p className="text-[10px] uppercase text-muted-foreground">{f.day}</p>
              <p className="mt-1 text-xs font-semibold">{f.rainChance}%</p>
              <p className="text-[10px] text-muted-foreground">{f.temp}°</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {weather.rainChance > 60
            ? "Heavy inflow expected — keep rainwater headroom above 20%."
            : "Low inflow expected — prioritise stored volume for irrigation."}
        </p>
      </div>
    </motion.div>
  );
}
