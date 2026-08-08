import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/aqualoop/page-shell";
import { PageHeader } from "@/components/aqualoop/page-header";
import { ChartCard, TrendArea, TrendBars, TrendLines } from "@/components/aqualoop/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulation } from "@/hooks/use-simulation";
import { dailyUsage, monthlyTrend, weeklyTrend } from "@/lib/simulation";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Water Analytics & Trends | AquaLoop" },
      {
        name: "description",
        content:
          "Explore level, temperature, TDS, pH, flow and savings trends across daily, weekly and monthly windows.",
      },
      { property: "og:title", content: "Water Analytics & Trends | AquaLoop" },
      {
        property: "og:description",
        content: "Daily, weekly and monthly water reuse analytics for both AquaLoop sources.",
      },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const { history } = useSimulation();
  const rw = history.rainwater;
  const ro = history.roReject;

  const merged = rw.map((p, i) => ({
    label: p.label,
    rainwaterLevel: p.waterLevel,
    roLevel: ro[i]?.waterLevel ?? 0,
    rainwaterTds: p.tds,
    roTds: ro[i]?.tds ?? 0,
    rainwaterPh: p.ph,
    roPh: ro[i]?.ph ?? 0,
    rainwaterTemp: p.temperature,
    roTemp: ro[i]?.temperature ?? 0,
    rainwaterFlow: p.flowRate,
    roFlow: ro[i]?.flowRate ?? 0,
    saved: p.saved + (ro[i]?.saved ?? 0),
  }));

  return (
    <PageShell>
      <PageHeader
        title="Analytics"
        subtitle="Simulated historical telemetry across both independent water loops."
      />

      <Tabs defaultValue="live">
        <TabsList>
          <TabsTrigger value="live">Live series</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-8 grid gap-8 xl:grid-cols-2">
          <ChartCard title="Water Level History" description="Both tanks, percentage full">
            <TrendLines
              data={merged}
              series={[
                { key: "rainwaterLevel", name: "Rainwater", color: "var(--color-chart-1)" },
                { key: "roLevel", name: "RO Reject", color: "var(--color-chart-2)" },
              ]}
            />
          </ChartCard>
          <ChartCard title="Temperature" description="Water temperature in °C" delay={0.05}>
            <TrendLines
              data={merged}
              series={[
                { key: "rainwaterTemp", name: "Rainwater", color: "var(--color-chart-3)" },
                { key: "roTemp", name: "RO Reject", color: "var(--color-chart-5)" },
              ]}
            />
          </ChartCard>
          <ChartCard title="TDS" description="Dissolved solids in ppm" delay={0.1}>
            <TrendLines
              data={merged}
              series={[
                { key: "rainwaterTds", name: "Rainwater", color: "var(--color-chart-1)" },
                { key: "roTds", name: "RO Reject", color: "var(--color-chart-4)" },
              ]}
            />
          </ChartCard>
          <ChartCard title="pH" description="Acidity across both loops" delay={0.15}>
            <TrendLines
              data={merged}
              series={[
                { key: "rainwaterPh", name: "Rainwater", color: "var(--color-chart-2)" },
                { key: "roPh", name: "RO Reject", color: "var(--color-chart-5)" },
              ]}
            />
          </ChartCard>
          <ChartCard title="Flow Rate" description="Litres per minute" delay={0.2}>
            <TrendLines
              data={merged}
              series={[
                { key: "rainwaterFlow", name: "Rainwater", color: "var(--color-chart-3)" },
                { key: "roFlow", name: "RO Reject", color: "var(--color-chart-2)" },
              ]}
            />
          </ChartCard>
          <ChartCard title="Water Savings" description="Combined litres recovered" delay={0.25}>
            <TrendArea data={merged} dataKey="saved" color="var(--color-chart-2)" unit="L" />
          </ChartCard>
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <ChartCard title="Daily Trends" description="Dispatch volume by destination">
            <TrendBars
              data={dailyUsage}
              stacked
              series={[
                { key: "irrigation", name: "Irrigation", color: "var(--color-chart-2)" },
                { key: "flushing", name: "Flushing", color: "var(--color-chart-1)" },
                { key: "recharge", name: "Recharge", color: "var(--color-chart-3)" },
              ]}
            />
          </ChartCard>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <ChartCard title="Weekly Trends" description="Litres saved per source">
            <TrendBars
              data={weeklyTrend}
              series={[
                { key: "rainwater", name: "Rainwater", color: "var(--color-chart-1)" },
                { key: "roReject", name: "RO Reject", color: "var(--color-chart-2)" },
              ]}
            />
          </ChartCard>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <ChartCard title="Monthly Trends" description="Cumulative recovery per month">
            <TrendBars
              data={monthlyTrend}
              stacked
              series={[
                { key: "rainwater", name: "Rainwater", color: "var(--color-chart-1)" },
                { key: "roReject", name: "RO Reject", color: "var(--color-chart-2)" },
              ]}
            />
          </ChartCard>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
