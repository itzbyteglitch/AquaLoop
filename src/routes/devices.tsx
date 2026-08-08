import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Cpu, RefreshCw, Download, Lightbulb, Wifi, BatteryMedium, Clock } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/aqualoop/page-shell";
import { PageHeader } from "@/components/aqualoop/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSimulation } from "@/hooks/use-simulation";
import { TANK_META, formatAgo } from "@/lib/simulation";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "ESP32 Devices | AquaLoop" },
      {
        name: "description",
        content:
          "Manage the two AquaLoop ESP32 sensor nodes: firmware, WiFi strength, battery, sync status and remote actions.",
      },
      { property: "og:title", content: "ESP32 Devices | AquaLoop" },
      {
        property: "og:description",
        content: "Device fleet view for the AquaLoop rainwater and RO reject sensor nodes.",
      },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const { devices, tanks, now, deviceAction } = useSimulation();

  const run = (id: string, action: string, message: string) => {
    deviceAction(id, action);
    toast.success(message);
  };

  return (
    <PageShell>
      <PageHeader
        title="Devices"
        subtitle="Simulated ESP32 nodes — one per water loop, no shared plumbing."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {devices.map((device, i) => {
          const tank = tanks[device.tankId];
          return (
            <motion.section
              key={device.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-soft p-5"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Cpu className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{device.name}</h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {TANK_META[device.tankId].name} · {device.id}
                  </p>
                </div>
                <Badge
                  variant={tank.status === "online" ? "secondary" : "destructive"}
                  className="shrink-0 capitalize"
                >
                  <motion.span
                    className="mr-1.5 h-2 w-2 rounded-full bg-current"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                  {tank.status}
                </Badge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <Metric label="Firmware" value={device.firmware} />
                <Metric label="Uptime" value={`${device.uptimeHours} h`} />
                <Metric
                  label="Last sync"
                  value={formatAgo(device.lastSync, now)}
                  icon={<Clock className="h-3.5 w-3.5" />}
                />
                <Metric
                  label="WiFi"
                  value={`${tank.wifi} dBm`}
                  icon={<Wifi className="h-3.5 w-3.5" />}
                />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <BatteryMedium className="h-4 w-4" /> Battery
                  </span>
                  <span className="font-medium">{tank.battery}%</span>
                </div>
                <Progress value={tank.battery} className="mt-2 h-1.5" />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => run(device.id, "Restart", `${device.name} restarting…`)}
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Restart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    run(device.id, "Firmware update", `Firmware pushed to ${device.name}`)
                  }
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Update firmware
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => run(device.id, "Blink LED", `${device.name} LED blinking`)}
                >
                  <Lightbulb className="mr-1.5 h-3.5 w-3.5" /> Blink LED
                </Button>
              </div>
            </motion.section>
          );
        })}
      </div>
    </PageShell>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/60 p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  );
}
