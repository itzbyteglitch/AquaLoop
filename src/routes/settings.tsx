import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageShell } from "@/components/aqualoop/page-shell";
import { PageHeader } from "@/components/aqualoop/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ModeSwitcher } from "@/components/aqualoop/mode-switcher";
import { useSimulation } from "@/hooks/use-simulation";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Simulation Settings | AquaLoop" },
      {
        name: "description",
        content:
          "Control AquaLoop demo behaviour: theme, simulation speed, random failure injection, alerts and reset.",
      },
      { property: "og:title", content: "Simulation Settings | AquaLoop" },
      {
        property: "og:description",
        content: "Tune the AquaLoop prototype simulation for your demo.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, setSettings, resetSimulation } = useSimulation();

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        subtitle="Everything here controls the frontend simulation only."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-soft space-y-6 p-5">
          <h2 className="text-base font-semibold">Appearance & Behaviour</h2>

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Label>Dark mode</Label>
              <p className="text-sm text-muted-foreground">Switch the dashboard theme.</p>
            </div>
            <Switch checked={settings.dark} onCheckedChange={(v) => setSettings({ dark: v })} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Label>Enable random failures</Label>
              <p className="text-sm text-muted-foreground">
                Injects leaks, offline nodes and quality spikes.
              </p>
            </div>
            <Switch
              checked={settings.randomFailures}
              onCheckedChange={(v) => setSettings({ randomFailures: v })}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Label>Enable alerts</Label>
              <p className="text-sm text-muted-foreground">Raise notifications for anomalies.</p>
            </div>
            <Switch
              checked={settings.alertsEnabled}
              onCheckedChange={(v) => setSettings({ alertsEnabled: v })}
            />
          </div>

          <div>
            <Label>Simulation speed — {settings.speed.toFixed(1)}×</Label>
            <Slider
              className="mt-3"
              min={0.5}
              max={4}
              step={0.5}
              value={[settings.speed]}
              onValueChange={([v]) => setSettings({ speed: v ?? 1 })}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Higher speed shortens the sensor refresh interval.
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={() => {
              resetSimulation();
              toast.success("Simulation reset to baseline");
            }}
          >
            Reset simulation
          </Button>
        </section>

        <section className="card-soft space-y-4 p-5">
          <h2 className="text-base font-semibold">Default Operating Mode</h2>
          <ModeSwitcher full />
          <p className="text-sm text-muted-foreground">
            Manual gives you full control, Assisted asks for confirmation, and Autonomous applies
            safe recommendations the moment they change.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
