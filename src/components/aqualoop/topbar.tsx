import { motion } from "framer-motion";
import { Moon, Sun, Bell, Gauge } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulation } from "@/hooks/use-simulation";
import { Link } from "@tanstack/react-router";

export function Topbar() {
  const { now, settings, setSettings, alerts, systemHealth } = useSimulation();
  const unread = alerts.filter((a) => !a.acknowledged).length;
  const time = new Date(now);

  return (
    <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/80 px-3 py-2.5 backdrop-blur-xl sm:px-5">
      <SidebarTrigger className="shrink-0" />
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold">
          Smart Water Today, Sustainable Tomorrow
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {time.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}{" "}
          ·{" "}
          <motion.span key={time.getSeconds()} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
            {time.toLocaleTimeString()}
          </motion.span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Badge variant="secondary" className="hidden gap-1 sm:flex">
          <Gauge className="h-3 w-3" /> {systemHealth}% health
        </Badge>
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link to="/alerts" aria-label="Alerts">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"
              />
            )}
          </Link>
        </Button>
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
