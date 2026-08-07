import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Users, Lightbulb, Target, Rocket, Award, Github } from "lucide-react";
import { PageShell } from "@/components/aqualoop/page-shell";
import { PageHeader } from "@/components/aqualoop/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/launchverse")({
  head: () => ({
    meta: [
      { title: "LaunchVerse Judges | AquaLoop" },
      {
        name: "description",
        content:
          "Information for LaunchVerse competition judges: project overview, team, innovation highlights, and technical details.",
      },
      { property: "og:title", content: "LaunchVerse Judges | AquaLoop" },
      {
        property: "og:description",
        content: "AquaLoop - Smart water conservation dashboard for LaunchVerse competition.",
      },
    ],
  }),
  component: LaunchVersePage,
});

function LaunchVersePage() {
  return (
    <PageShell>
      <PageHeader
        title="LaunchVerse Judges"
        subtitle="Everything you need to evaluate AquaLoop for the competition."
      />

      <section className="card-soft p-6">
        <h2 className="text-base font-semibold">Project Summary</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <strong>AquaLoop</strong> is an intelligent IoT dashboard that monitors two independent
          water loops — <strong>rainwater harvesting</strong> and{" "}
          <strong>reverse-osmosis reject recovery</strong> — with real-time telemetry, composite
          water-quality scoring (0–100), and explainable reuse recommendations. It runs as a fully
          self-contained prototype with a client-side simulation engine — no hardware or backend
          required.
        </p>
      </section>

      <section className="card-soft p-6">
        <h2 className="text-base font-semibold">Problem & Innovation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <Target className="h-4 w-4" />
              Problem
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Buildings waste millions of litres annually through two streams: roof rainwater runoff
              and RO purification reject concentrate. Both are physically separate, monitorable, and
              reusable for non-potable needs — but rarely recovered.
            </p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Lightbulb className="h-4 w-4" />
              Innovation
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Dual-loop isolation with explainable AI recommendations: composite quality scoring,
              confidence decay, three operating modes (Manual/Assisted/Autonomous), and full
              observability — all in a zero-hardware prototype.
            </p>
          </div>
        </div>
      </section>

      <section className="card-soft p-6">
        <h2 className="text-base font-semibold">Technical Highlights</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Highlight icon={Rocket} title="Full-Stack SSR" desc="TanStack Start + Nitro" />
          <Highlight icon={Award} title="Type-Safe" desc="TypeScript strict mode" />
          <Highlight icon={Users} title="Responsive UI" desc="Tailwind v4 + shadcn/ui" />
          <Highlight icon={Github} title="Open Source" desc="MIT License" />
        </div>
      </section>

      <section className="card-soft p-6">
        <h2 className="text-base font-semibold">Team</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TeamCard name="Aditya" role="Team Leader" />
          <TeamCard name="Divyansh" role="Software Development · Technical Director" />
          <TeamCard name="Anmol" role="Project Director" />
          <TeamCard name="Nitika" role="Design & Sketching" />
          <TeamCard name="Pema" role="Design & Sketching" />
          <TeamCard name="Advaita" role="Presentation & Judge Representative" />
        </div>
      </section>

      <section className="card-soft p-6">
        <h2 className="text-base font-semibold">Quick Links for Evaluation</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" asChild>
              <a href="/">Live Demo (Dashboard)</a>
            </Button>
          </a>
          <a href="/rainwater" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" asChild>
              <a href="/rainwater">Rainwater Tank Detail</a>
            </Button>
          </a>
          <a href="/ro-reject" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" asChild>
              <a href="/ro-reject">RO Reject Tank Detail</a>
            </Button>
          </a>
          <a href="/analytics" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" asChild>
              <a href="/analytics">Analytics & Trends</a>
            </Button>
          </a>
          <a href="/recommendations" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" asChild>
              <a href="/recommendations">AI Recommendations</a>
            </Button>
          </a>
          <a href="/help" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" asChild>
              <a href="/help">Architecture & FAQ</a>
            </Button>
          </a>
          <a
            href="https://github.com/itzbyteglitch/AquaLoop"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" asChild>
              <Github className="mr-1.5 h-3.5 w-3.5" />
              GitHub Repository
            </Button>
          </a>
        </div>
      </section>

      <section className="card-soft p-6">
        <h2 className="text-base font-semibold">Competition Criteria Mapping</h2>
        <div className="mt-4 space-y-3 text-sm">
          <CriteriaRow
            criterion="Technical Depth"
            details="Full-stack SSR, simulation engine, domain types, 11 routes, animated UI"
          />
          <CriteriaRow
            criterion="Real-World Relevance"
            details="Addresses UN SDG 6 (Clean Water) & 11 (Sustainable Cities)"
          />
          <CriteriaRow
            criterion="Open-Source Readiness"
            details="MIT license, zero proprietary deps, npm scripts, reproducible builds"
          />
          <CriteriaRow
            criterion="Demoability"
            details="Runs instantly with <code>npm run dev</code> — no cloud account, no hardware"
          />
          <CriteriaRow
            criterion="Extensibility"
            details="Clean separation: UI ↔ simulation ↔ hardware abstraction"
          />
        </div>
      </section>
    </PageShell>
  );
}

function Highlight({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Trophy;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function TeamCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 text-center">
      <p className="font-semibold text-base">{name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{role}</p>
    </div>
  );
}

function CriteriaRow({ criterion, details }: { criterion: string; details: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-3">
      <div className="flex gap-3">
        <Trophy className="h-5 w-5 shrink-0 text-primary mt-0.5" />
        <div>
          <p className="font-medium">{criterion}</p>
          <p className="text-xs text-muted-foreground">{details}</p>
        </div>
      </div>
    </div>
  );
}
