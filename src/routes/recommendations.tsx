import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/aqualoop/page-shell";
import { PageHeader } from "@/components/aqualoop/page-header";
import { RecommendationCard } from "@/components/aqualoop/recommendation-card";
import { ModeSwitcher } from "@/components/aqualoop/mode-switcher";
import { Badge } from "@/components/ui/badge";
import { useSimulation } from "@/hooks/use-simulation";
import { TANK_META, formatAgo } from "@/lib/simulation";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "AI Reuse Recommendations | AquaLoop" },
      {
        name: "description",
        content:
          "Timeline of AquaLoop reuse recommendations with confidence scores, reasoning, suggested actions and expected benefits.",
      },
      { property: "og:title", content: "AI Reuse Recommendations | AquaLoop" },
      {
        property: "og:description",
        content: "Explainable water reuse decisions with confidence and reasoning.",
      },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { recommendations, recommendationLog, now } = useSimulation();

  return (
    <PageShell>
      <PageHeader
        title="Recommendations"
        subtitle="Explainable reuse decisions generated from live sensor readings."
        actions={<ModeSwitcher />}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <RecommendationCard rec={recommendations.rainwater} />
        <RecommendationCard rec={recommendations.roReject} />
      </div>

      <section className="card-soft p-5">
        <h3 className="text-base font-semibold">Decision Timeline</h3>
        <p className="text-sm text-muted-foreground">
          Every change the recommendation engine has published this session.
        </p>
        <div className="mt-5 space-y-0">
          {recommendationLog.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-4"
            >
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${
                    rec.severity === "good"
                      ? "bg-success"
                      : rec.severity === "caution"
                        ? "bg-warning"
                        : "bg-destructive"
                  }`}
                />
                <span className="w-px flex-1 bg-border" />
              </div>
              <div className="min-w-0 pb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{rec.headline}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {TANK_META[rec.tankId].short}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {rec.confidence}% confidence
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatAgo(rec.createdAt, now)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{rec.reasoning[0]}</p>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-muted-foreground">Action: </span>
                    {rec.action}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Benefit: </span>
                    {rec.benefit}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          {recommendationLog.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No changes yet — the engine publishes an entry whenever a decision shifts.
            </p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
