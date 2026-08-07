import { motion } from "framer-motion";
import { Info, AlertTriangle, OctagonAlert, Check } from "lucide-react";
import type { AlertItem } from "@/types/aqualoop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatAgo, TANK_META } from "@/lib/simulation";
import { useSimulation } from "@/hooks/use-simulation";

const config = {
  info: { icon: Info, tone: "text-primary bg-primary/10", label: "Info" },
  warning: { icon: AlertTriangle, tone: "text-warning bg-warning/15", label: "Warning" },
  critical: { icon: OctagonAlert, tone: "text-destructive bg-destructive/10", label: "Critical" },
};

export function AlertRow({ alert, showAck = true }: { alert: AlertItem; showAck?: boolean }) {
  const { acknowledgeAlert, now } = useSimulation();
  const c = config[alert.severity];
  const Icon = c.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: alert.acknowledged ? 0.55 : 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-border bg-card p-4"
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${c.tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{alert.title}</p>
          <Badge variant="outline" className="text-[10px]">
            {c.label}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {TANK_META[alert.tankId].short}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{alert.detail}</p>
        <p className="mt-1 text-xs text-muted-foreground">{formatAgo(alert.createdAt, now)}</p>
      </div>
      {showAck && !alert.acknowledged && (
        <Button size="sm" variant="ghost" onClick={() => acknowledgeAlert(alert.id)}>
          <Check className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}
