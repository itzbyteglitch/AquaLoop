import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CloudRain,
  Recycle,
  BarChart3,
  Sparkles,
  Bell,
  Cpu,
  History,
  Wrench,
  Settings,
  LifeBuoy,
  Droplets,
  Github,
  Trophy,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSimulation } from "@/hooks/use-simulation";
import { Badge } from "@/components/ui/badge";

const monitoring = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Rainwater Tank", url: "/rainwater", icon: CloudRain },
  { title: "RO Reject Tank", url: "/ro-reject", icon: Recycle },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
] as const;

const intelligence = [
  { title: "Recommendations", url: "/recommendations", icon: Sparkles },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "History", url: "/history", icon: History },
] as const;

const system = [
  { title: "Devices", url: "/devices", icon: Cpu },
  { title: "Maintenance", url: "/maintenance", icon: Wrench },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: LifeBuoy },
  { title: "LaunchVerse", url: "/launchverse", icon: Trophy },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { alerts } = useSimulation();
  const unread = alerts.filter((a) => !a.acknowledged).length;

  const renderGroup = (
    label: string,
    items: readonly { title: string; url: string; icon: typeof Droplets }[],
  ) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                <Link to={item.url} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                  {!collapsed && item.url === "/alerts" && unread > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                      {unread}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        {renderGroup("Monitoring", monitoring)}
        {renderGroup("Intelligence", intelligence)}
        {renderGroup("System", system)}
      </SidebarContent>
      {!collapsed && (
        <SidebarFooter>
          <p className="px-2 pb-2 text-[11px] leading-relaxed text-muted-foreground">
            Prototype build · simulated telemetry only
          </p>
          <a
            href="https://github.com/itzbyteglitch/AquaLoop"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-2 py-2 text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            <span>View on GitHub</span>
          </a>
        </SidebarFooter>
      )}

      <SidebarFooter className="flex justify-start p-2">
        <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-accent" />
      </SidebarFooter>
    </Sidebar>
  );
}
