import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, CloudRain, Gauge, Recycle } from "lucide-react";
import { PageShell } from "@/components/aqualoop/page-shell";
import { PageHeader } from "@/components/aqualoop/page-header";
import { StatCard } from "@/components/aqualoop/stat-card";
import { WeatherWidget } from "@/components/aqualoop/weather-widget";
import { RoutingDiagram } from "@/components/aqualoop/routing-diagram";
import { TankVisual } from "@/components/aqualoop/tank-visual";
import { RecommendationCard } from "@/components/aqualoop/recommendation-card";
import { EventLog } from "@/components/aqualoop/event-log";
import { ChartCard, TrendArea, TrendLines } from "@/components/aqualoop/charts";
import { ModeSwitcher } from "@/components/aqualoop/mode-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulation } from "@/hooks/use-simulation";
import { TANK_META } from "@/lib/simulation";
import type { TankId } from "@/types/aqualoop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | AquaLoop" },
      {
        name: "description",
        content:
          "Live overview of the AquaLoop system: rainwater and RO reject levels, water quality, routing state, savings and recent events.",
      },
      { property: "og:title", content: "Dashboard | AquaLoop" },
      {
        property: "og:description",
        content: "Real-time monitoring of two independent water loops with reuse recommendations.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { history, recommendations, alerts, totalSaved, systemHealth, weather } = useSimulation();
  const unread = alerts.filter((a) => !a.acknowledged).length;

  const merged = history.rainwater.map((p, i) => ({
    label: p.label,
    rainwaterLevel: p.waterLevel,
    roLevel: history.roReject[i]?.waterLevel ?? 0,
    saved: p.saved + (history.roReject[i]?.saved ?? 0),
  }));

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        subtitle="Live status of both independent water loops — nothing ever mixes."
        actions={<ModeSwitcher />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Recycle}
          label="Water recovered"
          value={totalSaved.toLocaleString()}
          unit="L"
          hint="Lifetime litres reused"
          tone="good"
        />
        <StatCard
          icon={Gauge}
          label="System health"
          value={systemHealth}
          unit="%"
          hint="Quality & device composite"
          tone={systemHealth >= 75 ? "good" : systemHealth >= 50 ? "warn" : "bad"}
        />
        <StatCard
          icon={Bell}
          label="Active alerts"
          value={unread}
          hint="Unacknowledged events"
          tone={unread > 0 ? "warn" : "default"}
        />
        <StatCard
          icon={CloudRain}
          label="Rain chance today"
          value={weather.rainChance}
          unit="%"
          hint="Inflow outlook"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <WeatherWidget />
        <div className="lg:col-span-2">
          <RoutingDiagram />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecommendationCard rec={recommendations.rainwater} compact />
        <RecommendationCard rec={recommendations.roReject} compact />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Water Level History" description="Both tanks, percentage full">
          <TrendLines
            data={merged}
            series={[
              { key: "rainwaterLevel", name: "Rainwater", color: "var(--color-chart-1)" },
              { key: "roLevel", name: "RO Reject", color: "var(--color-chart-2)" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Water Savings" description="Combined litres recovered" delay={0.1}>
          <TrendArea data={merged} dataKey="saved" color="var(--color-chart-2)" unit="L" />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <TankCard tankId="rainwater" />
        <TankCard tankId="roReject" />
        <EventLog limit={6} title="Live Event Log" />
      </div>
    </PageShell>
  );
}

function TankCard({ tankId }: { tankId: TankId }) {
  const { tanks } = useSimulation();
  const tank = tanks[tankId];
  const href = tankId === "rainwater" ? "/rainwater" : "/ro-reject";

  return (
    <section className="card-soft flex flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-base font-semibold">{TANK_META[tankId].name}</h2>
        <Badge
          variant={tank.status === "online" ? "secondary" : "destructive"}
          className="shrink-0 capitalize"
        >
          {tank.status}
        </Badge>
      </div>
      <div className="my-4">
        <TankVisual
          tankId={tankId}
          level={tank.waterLevel}
          size="sm"
          label={`${Math.round((tank.waterLevel / 100) * tank.capacityLiters).toLocaleString()} L stored`}
        />
      </div>
      <Button asChild variant="outline" size="sm" className="mt-auto">
        <Link to={href}>
          Open {TANK_META[tankId].short}
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </Button>
    </section>
  );
}
