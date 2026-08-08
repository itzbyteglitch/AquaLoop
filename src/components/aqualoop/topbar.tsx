import { motion } from "framer-motion";
import { Moon, Sun, Bell, Gauge, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulation } from "@/hooks/use-simulation";
import { Link } from "@tanstack/react-router";

export function Topbar() {
  const { now, settings, setSettings, alerts, systemHealth } = useSimulation();
  const unread = alerts.filter((a) => !a.acknowledged).length;
  const time = new Date(now);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <span className="gradient-brand grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-[var(--shadow-glow)]">
          <Gauge className="h-5 w-5 text-primary-foreground" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold">AquaLoop</p>
          <p className="truncate text-xs text-muted-foreground">
            Smart Water Today, Sustainable Tomorrow
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="flex gap-1.5">
          <Gauge className="h-3 w-3" /> {systemHealth}% health
        </Badge>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(now).toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <motion.span
              key={new Date().getSeconds()}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
            >
              {new Date().toLocaleTimeString()}
            </motion.span>
          </span>
        </div>
        <Badge variant="secondary" className="flex gap-1.5">
          <Bell className="h-3 w-3" /> {unread > 0 ? unread : 0} alerts
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setSettings({ dark: !settings.dark })}
        >
          {settings.dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
