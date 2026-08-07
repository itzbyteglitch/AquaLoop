import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/aqualoop/page-shell";
import { PageHeader } from "@/components/aqualoop/page-header";
import { EventLog } from "@/components/aqualoop/event-log";
import { useSimulation } from "@/hooks/use-simulation";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Event History | AquaLoop" },
      {
        name: "description",
        content:
          "Chronological AquaLoop event history: routing decisions, sensor updates, leaks and recommendation changes.",
      },
      { property: "og:title", content: "Event History | AquaLoop" },
      {
        property: "og:description",
        content: "Full session timeline of AquaLoop system events.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { events } = useSimulation();

  return (
    <PageShell>
      <PageHeader
        title="History"
        subtitle={`${events.length} events recorded in this simulation session.`}
      />
      <EventLog limit={120} title="Session Timeline" />
    </PageShell>
  );
}
