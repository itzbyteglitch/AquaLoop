import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/aqualoop/page-shell";
import { PageHeader } from "@/components/aqualoop/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance Schedule | AquaLoop" },
      {
        name: "description",
        content:
          "Sensor calibration checklist, cleaning schedule, filter replacement and tank/pump inspection tracking for AquaLoop.",
      },
      { property: "og:title", content: "Maintenance Schedule | AquaLoop" },
      {
        property: "og:description",
        content: "Keep both AquaLoop water loops serviced with a guided checklist.",
      },
    ],
  }),
  component: MaintenancePage,
});

const groups = [
  {
    title: "Sensor Calibration",
    due: "Every 30 days",
    items: [
      "Calibrate pH probe with 4.0 / 7.0 buffer",
      "Verify TDS probe against 1000 ppm standard",
      "Zero the turbidity sensor with distilled water",
      "Check flow meter pulse count",
    ],
  },
  {
    title: "Cleaning Schedule",
    due: "Every 14 days",
    items: [
      "Flush rainwater first-flush diverter",
      "Wipe RO reject tank inlet screen",
      "Clear leaf guard on roof gutter",
    ],
  },
  {
    title: "Filter Replacement",
    due: "Every 90 days",
    items: ["Replace 20 micron sediment cartridge", "Inspect carbon polishing stage"],
  },
  {
    title: "Tank & Pump Inspection",
    due: "Every 60 days",
    items: [
      "Inspect tank walls for algae growth",
      "Test float switch response",
      "Check pump seal and noise profile",
      "Verify non-return valve on both loops",
    ],
  },
];

function MaintenancePage() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const all = groups.flatMap((g) => g.items);
  const completed = all.filter((i) => done[i]).length;

  return (
    <PageShell>
      <PageHeader
        title="Maintenance"
        subtitle="Preventive tasks that keep both loops accurate and safe."
        actions={
          <Button size="sm" onClick={() => toast.success("Maintenance report exported (demo)")}>
            <FileDown className="mr-1.5 h-3.5 w-3.5" /> Export report
          </Button>
        }
      />

      <section className="card-soft p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Checklist progress</span>
          <span className="text-muted-foreground">
            {completed} / {all.length} complete
          </span>
        </div>
        <Progress value={(completed / all.length) * 100} className="mt-3 h-2" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((g) => (
          <section key={g.title} className="card-soft p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <h2 className="truncate text-base font-semibold">{g.title}</h2>
              <Badge variant="outline" className="shrink-0">
                {g.due}
              </Badge>
            </div>
            <ul className="mt-4 space-y-3">
              {g.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Checkbox
                    id={item}
                    checked={Boolean(done[item])}
                    onCheckedChange={(v) => setDone((p) => ({ ...p, [item]: Boolean(v) }))}
                  />
                  <label
                    htmlFor={item}
                    className={`min-w-0 text-sm ${done[item] ? "text-muted-foreground line-through" : ""}`}
                  >
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
