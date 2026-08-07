import { createFileRoute } from "@tanstack/react-router";
import { TankPage } from "@/components/aqualoop/tank-page";

export const Route = createFileRoute("/ro-reject")({
  head: () => ({
    meta: [
      { title: "RO Reject Water Tank | AquaLoop" },
      {
        name: "description",
        content:
          "Monitor recovered RO reject water: TDS, pH, turbidity, flow and safe non-potable reuse routing.",
      },
      { property: "og:title", content: "RO Reject Water Tank | AquaLoop" },
      {
        property: "og:description",
        content: "Recovered RO concentrate telemetry with independent quality scoring.",
      },
    ],
  }),
  component: () => <TankPage tankId="roReject" />,
});
