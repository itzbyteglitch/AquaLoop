import {
  CloudRain,
  Recycle,
  Clock,
  Signal,
  Sprout,
  Toilet,
  Waves,
  Brush,
  PauseCircle,
} from "lucide-react";
import { PageShell } from "@/components/aqualoop/page-shell";
import { PageHeader } from "@/components/aqualoop/page-header";
import { TankVisual } from "@/components/aqualoop/tank-visual";
import { SensorGrid } from "@/components/aqualoop/sensor-grid";
import { QualityRing } from "@/components/aqualoop/quality-ring";
import { RecommendationCard } from "@/components/aqualoop/recommendation-card";
import { ChartCard, TrendArea, TrendLines } from "@/components/aqualoop/charts";
import { ModeSwitcher } from "@/components/aqualoop/mode-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulation } from "@/hooks/use-simulation";
import { TANK_META, formatAgo } from "@/lib/simulation";
import type { Destination, TankId } from "@/types/aqualoop";

const destinations: { id: Destination; icon: typeof Sprout }[] = [
  { id: "Irrigation", icon: Sprout },
  { id: "Toilet Flushing", icon: Toilet },
  { id: "Groundwater Recharge", icon: Waves },
  { id: "Floor Cleaning", icon: Brush },
  { id: "Holding / No Use", icon: PauseCircle },
];

export function TankPage({ tankId }: { tankId: TankId }) {
  const { tanks, history, recommendations, now, routes, routeTank, mode, devices } =
    useSimulation();
  const tank = tanks[tankId];
  const data = history[tankId];
  const device = devices.find((d) => d.tankId === tankId)!;
  const Icon = tankId === "rainwater" ? CloudRain : Recycle;

  const statusTone =
    tank.status === "online" ? "default" : tank.status === "degraded" ? "secondary" : "destructive";

  return (
    <PageShell>
      <PageHeader
        title={TANK_META[tankId].name}
        subtitle={
          tankId === "rainwater"
            ? "Harvested roof runoff — isolated loop, never mixed with RO reject."
            : "Recovered RO concentrate — isolated loop, never mixed with rainwater."
        }
        actions={
          <>
            <Badge variant={statusTone} className="capitalize">
              <Signal className="mr-1 h-3 w-3" /> {tank.status}
            </Badge>
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" /> {formatAgo(tank.lastUpdated, now)}
            </Badge>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="card-soft p-6">
            <div className="mb-4 flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Live Storage</h2>
            </div>
            <TankVisual tankId={tankId} level={tank.waterLevel} size="lg" />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {Math.round((tank.waterLevel / 100) * tank.capacityLiters).toLocaleString()} L of{" "}
              {tank.capacityLiters.toLocaleString()} L
            </p>
          </section>

          <section className="card-soft p-6">
            <QualityRing score={tank.qualityScore} />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Composite of pH, TDS, turbidity and device health.
            </p>
          </section>

          <section className="card-soft space-y-3 p-5">
            <h3 className="text-base font-semibold">Device Health</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Node</span>
              <span className="font-medium">{device.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Firmware</span>
              <span className="font-medium">{device.firmware}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Battery</span>
              <span className="font-medium">{tank.battery}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">WiFi</span>
              <span className="font-medium">{tank.wifi} dBm</span>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <SensorGrid tank={tank} />
          <RecommendationCard rec={recommendations[tankId]} />

          <section className="card-soft p-5">
            <h3 className="text-base font-semibold">Routing Control</h3>
            <p className="text-sm text-muted-foreground">
              {mode === "manual"
                ? "Manual mode — pick the destination yourself."
                : mode === "assisted"
                  ? "Assisted mode — confirm the suggestion above or override here."
                  : "Autonomous mode — the system routes automatically; overrides still allowed."}
            </p>
            <div className="mt-3">
              <ModeSwitcher />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {destinations.map((d) => (
                <Button
                  key={d.id}
                  size="sm"
                  variant={routes[tankId] === d.id ? "default" : "outline"}
                  onClick={() => routeTank(tankId, d.id)}
                >
                  <d.icon className="mr-1.5 h-3.5 w-3.5" />
                  {d.id}
                </Button>
              ))}
            </div>
          </section>

          <ChartCard title="Water Level History" description="Last cycles of stored volume">
            <TrendArea data={data} dataKey="waterLevel" unit="%" />
          </ChartCard>

          <ChartCard title="Quality Trends" description="TDS, turbidity and pH over time">
            <TrendLines
              data={data}
              series={[
                { key: "tds", name: "TDS (ppm)", color: "var(--color-chart-1)" },
                { key: "turbidity", name: "Turbidity (NTU)", color: "var(--color-chart-2)" },
                { key: "ph", name: "pH", color: "var(--color-chart-4)" },
              ]}
            />
          </ChartCard>

          <ChartCard title="Flow & Temperature" description="Inlet flow against water temperature">
            <TrendLines
              data={data}
              series={[
                { key: "flowRate", name: "Flow (L/min)", color: "var(--color-chart-3)" },
                { key: "temperature", name: "Temp (°C)", color: "var(--color-chart-5)" },
              ]}
            />
          </ChartCard>
        </div>
      </div>
    </PageShell>
  );
}
