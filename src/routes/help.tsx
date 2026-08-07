import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, Cpu, Brain, Route as RouteIcon, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/aqualoop/page-shell";
import { PageHeader } from "@/components/aqualoop/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "How AquaLoop Works | Help" },
      {
        name: "description",
        content:
          "Understand the AquaLoop architecture, the three operating modes, how recommendations are generated, and FAQs.",
      },
      { property: "og:title", content: "How AquaLoop Works | Help" },
      {
        property: "og:description",
        content: "Architecture, operating modes and recommendation logic explained.",
      },
    ],
  }),
  component: HelpPage,
});

const faqs = [
  {
    q: "Can the two water sources ever mix?",
    a: "No. Rainwater and RO reject water run through physically separate tanks, pipes, sensors and valves. AquaLoop models them as two isolated loops with independent analytics and recommendations.",
  },
  {
    q: "Is this connected to real hardware?",
    a: "Not in this build. Every reading is produced by an on-device simulation engine so the concept can be demonstrated without a physical rig.",
  },
  {
    q: "How is the water quality score calculated?",
    a: "It blends pH deviation from neutral, TDS relative to the source's safe ceiling, turbidity, leak state and device health into a 0–100 composite.",
  },
  {
    q: "What happens when a sensor goes offline?",
    a: "The node is flagged, a critical alert is raised, routing recommendations are blocked, and the last known reading is retained until telemetry resumes.",
  },
  {
    q: "Why does RO reject water have such high TDS?",
    a: "Reverse osmosis concentrates dissolved salts into the reject stream. That water is unfit for drinking but excellent for flushing, floor cleaning and recharge when TDS stays within limits.",
  },
];

function HelpPage() {
  return (
    <PageShell>
      <PageHeader
        title="Help & Documentation"
        subtitle="Smart Water Today, Sustainable Tomorrow — how the system fits together."
      />

      <section className="card-soft p-6">
        <h2 className="text-base font-semibold">Project Overview</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          AquaLoop is an intelligent water management system that recovers two waste streams most
          buildings throw away: harvested rainwater and reverse-osmosis reject water. Each stream is
          measured continuously, scored for quality and matched to the best reuse destination —
          irrigation, toilet flushing, floor cleaning or groundwater recharge — without ever mixing
          the two loops.
        </p>
      </section>

      <section className="card-soft p-6">
        <h2 className="text-base font-semibold">System Architecture</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <ArchBox
            icon={CloudRain}
            title="Source Layer"
            lines={["Rainwater tank", "RO reject tank", "Physically isolated"]}
          />
          <Arrow />
          <ArchBox
            icon={Cpu}
            title="Sensing Layer"
            lines={["ESP32 nodes", "pH · TDS · turbidity", "Level · flow · leak"]}
          />
          <Arrow />
          <ArchBox
            icon={Brain}
            title="Decision Layer"
            lines={["Quality scoring", "Rule + confidence engine", "Explainable output"]}
          />
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
          <RouteIcon className="h-5 w-5 shrink-0 text-primary" />
          <p className="min-w-0 text-sm text-muted-foreground">
            The actuation layer opens the matching valve per loop, then logs the routing decision to
            the event timeline.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-soft p-6">
          <h2 className="text-base font-semibold">Operating Modes</h2>
          <div className="mt-4 space-y-4 text-sm">
            <Mode
              name="Manual"
              body="You choose the destination for each loop. The system only measures and warns."
            />
            <Mode
              name="Assisted"
              body="The engine proposes the best destination with a confidence score; nothing moves until you confirm."
            />
            <Mode
              name="Autonomous"
              body="Safe recommendations are applied the moment they change, with the routing animation showing the active path."
            />
          </div>
        </section>

        <section className="card-soft p-6">
          <h2 className="text-base font-semibold">How Recommendations Work</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
            {[
              "Each sensor cycle produces a fresh reading set per tank.",
              "Readings are scored against source-specific safe ranges for pH, TDS and turbidity.",
              "Blocking conditions (offline node, high TDS) override everything else.",
              "The remaining candidates are ranked, and the best reuse destination is published.",
              "Confidence is reduced for leaks, low volume and stale telemetry.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="card-soft p-6">
        <h2 className="text-base font-semibold">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="mt-2">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PageShell>
  );
}

function ArchBox({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof CloudRain;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <p className="truncate text-sm font-semibold">{title}</p>
      </div>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden items-center justify-center lg:flex">
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}

function Mode({ name, body }: { name: string; body: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="font-medium">{name}</p>
      <p className="mt-1 text-muted-foreground">{body}</p>
    </div>
  );
}
