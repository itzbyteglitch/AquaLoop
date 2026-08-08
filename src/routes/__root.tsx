import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SimulationProvider } from "@/hooks/use-simulation";
import { AppSidebar } from "@/components/aqualoop/app-sidebar";
import { Topbar } from "@/components/aqualoop/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AquaLoop — Smart Water Today, Sustainable Tomorrow" },
      {
        name: "description",
        content:
          "AquaLoop is an intelligent IoT dashboard that monitors rainwater harvesting and RO reject recovery in two independent loops, scores water quality in real time and recommends the safest reuse destination.",
      },
      { name: "author", content: "AquaLoop Team" },
      { property: "og:title", content: "AquaLoop — Smart Water Today, Sustainable Tomorrow" },
      {
        property: "og:description",
        content:
          "Monitor rainwater and RO reject loops, score water quality live and get explainable reuse recommendations.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/og-image.svg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AquaLoop — Smart Water Today, Sustainable Tomorrow" },
      {
        name: "twitter:description",
        content: "Smart water conservation with independent rainwater and RO reject loops.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.svg" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SimulationProvider>
        <SidebarProvider>
          <div className="flex min-h-svh flex-col">
            <AppSidebar />
            <SidebarInset>
              <Topbar />
              <main className="flex-1 w-full">
                <Outlet />
              </main>
              <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
                <div className="mx-auto max-w-full px-4 py-3 text-center text-xs text-muted-foreground">
                  <a
                    href="https://github.com/itzbyteglitch/AquaLoop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-2 hover:text-primary hover:no-underline transition-colors"
                  >
                    AquaLoop
                  </a>{" "}
                  © 2026 | Made by{" "}
                  <a
                    href="https://github.com/itzbyteglitch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-2 hover:text-primary hover:no-underline transition-colors"
                  >
                    ItzByteGlitch
                  </a>
                </div>
              </footer>
            </SidebarInset>
          </div>
          <Toaster position="top-right" richColors />
        </SidebarProvider>
      </SimulationProvider>
    </QueryClientProvider>
  );
}
