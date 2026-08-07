import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, CheckCircle2, AlertTriangle, Ban, ArrowRight } from "lucide-react";
import type { Recommendation } from "@/types/aqualoop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSimulation } from "@/hooks/use-simulation";
import { TANK_META } from "@/lib/simulation";

const icons = { good: CheckCircle2, caution: AlertTriangle, blocked: Ban };
const tones = {
  good: "text-success bg-success/10",
  caution: "text-warning bg-warning/15",
  blocked: "text-destructive bg-destructive/10",
};

export function RecommendationCard({
  rec,
  compact = false,
}: {
  rec: Recommendation;
  compact?: boolean;
}) {
  const { mode, confirmSuggestion, routes } = useSimulation();
  const Icon = icons[rec.severity];
  const routed = routes[rec.tankId] === rec.destination;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={rec.id}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className="card-soft p-5"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tones[rec.severity]}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {TANK_META[rec.tankId].short} · AI recommendation
              </p>
              <h3 className="mt-1 text-base font-semibold">{rec.headline}</h3>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Sparkles className="h-3 w-3" />
            {rec.confidence}%
          </Badge>
        </div>

        <div className="mt-4">
          <Progress value={rec.confidence} className="h-1.5" />
          <p className="mt-1.5 text-[11px] text-muted-foreground">Model confidence</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Destination</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Badge className="rounded-full">{rec.destination}</Badge>
        </div>

        {!compact && (
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Why this was generated
              </p>
              <ul className="mt-1.5 space-y-1">
                {rec.reasoning.map((r) => (
                  <li key={r} className="flex gap-2 text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Suggested action</p>
                <p className="mt-1">{rec.action}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Expected benefit</p>
                <p className="mt-1">{rec.benefit}</p>
              </div>
            </div>
          </div>
        )}

        {mode === "assisted" && rec.severity !== "blocked" && (
          <Button
            className="mt-4 w-full sm:w-auto"
            disabled={routed}
            onClick={() => confirmSuggestion(rec.tankId)}
          >
            {routed ? "Routing confirmed" : `Confirm route to ${rec.destination}`}
          </Button>
        )}
        {mode === "autonomous" && (
          <p className="mt-4 text-xs text-muted-foreground">
            Autonomous mode applies safe recommendations automatically.
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
