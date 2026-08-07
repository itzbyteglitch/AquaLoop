import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  TANK_META,
  buildRecommendation,
  generateHistory,
  generateWeather,
  initialTank,
  qualityScore,
  stepReading,
  uid,
} from "@/lib/simulation";
import type {
  AlertItem,
  Destination,
  EventItem,
  HistoryPoint,
  OperatingMode,
  Recommendation,
  TankId,
  TankState,
  WeatherState,
  DeviceInfo,
} from "@/types/aqualoop";

const TANK_IDS: TankId[] = ["rainwater", "roReject"];

export interface SimSettings {
  speed: number;
  randomFailures: boolean;
  alertsEnabled: boolean;
  dark: boolean;
}

interface SimContextValue {
  tanks: Record<TankId, TankState>;
  history: Record<TankId, HistoryPoint[]>;
  recommendations: Record<TankId, Recommendation>;
  recommendationLog: Recommendation[];
  alerts: AlertItem[];
  events: EventItem[];
  devices: DeviceInfo[];
  weather: WeatherState;
  mode: OperatingMode;
  routes: Record<TankId, Destination | null>;
  pendingRoutes: Record<TankId, Destination | null>;
  settings: SimSettings;
  now: number;
  totalSaved: number;
  systemHealth: number;
  setMode: (m: OperatingMode) => void;
  setSettings: (patch: Partial<SimSettings>) => void;
  routeTank: (tankId: TankId, destination: Destination) => void;
  confirmSuggestion: (tankId: TankId) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
  deviceAction: (deviceId: string, action: string) => void;
  resetSimulation: () => void;
  pushEvent: (e: Omit<EventItem, "id" | "createdAt">) => void;
}

const SimContext = createContext<SimContextValue | null>(null);

function initTanks(): Record<TankId, TankState> {
  return { rainwater: initialTank("rainwater"), roReject: initialTank("roReject") };
}

function initDevices(): DeviceInfo[] {
  return [
    {
      id: "esp32-rw-01",
      tankId: "rainwater",
      name: "AquaNode RW-01",
      firmware: "v2.4.1",
      lastSync: Date.now(),
      uptimeHours: 412,
    },
    {
      id: "esp32-ro-02",
      tankId: "roReject",
      name: "AquaNode RO-02",
      firmware: "v2.3.8",
      lastSync: Date.now(),
      uptimeHours: 297,
    },
  ];
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [tanks, setTanks] = useState<Record<TankId, TankState>>(initTanks);
  const [history, setHistory] = useState<Record<TankId, HistoryPoint[]>>(() => ({
    rainwater: generateHistory("rainwater", 40, 900_000),
    roReject: generateHistory("roReject", 40, 900_000),
  }));
  const [recommendations, setRecommendations] = useState<Record<TankId, Recommendation>>(() => {
    const t = initTanks();
    return {
      rainwater: buildRecommendation(t.rainwater),
      roReject: buildRecommendation(t.roReject),
    };
  });
  const [recommendationLog, setRecommendationLog] = useState<Recommendation[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>(initDevices);
  const [weather, setWeather] = useState<WeatherState>(generateWeather);
  const [mode, setModeState] = useState<OperatingMode>("assisted");
  const [routes, setRoutes] = useState<Record<TankId, Destination | null>>({
    rainwater: null,
    roReject: null,
  });
  const [settings, setSettingsState] = useState<SimSettings>({
    speed: 1,
    randomFailures: true,
    alertsEnabled: true,
    dark: false,
  });
  const [now, setNow] = useState(() => Date.now());
  const [totalSaved, setTotalSaved] = useState(() => 18420);

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const pushEvent = useCallback((e: Omit<EventItem, "id" | "createdAt">) => {
    setEvents((prev) => [{ ...e, id: uid(), createdAt: Date.now() }, ...prev].slice(0, 120));
  }, []);

  const pushAlert = useCallback((a: Omit<AlertItem, "id" | "createdAt" | "acknowledged">) => {
    if (!settingsRef.current.alertsEnabled) return;
    setAlerts((prev) => {
      if (prev.some((p) => !p.acknowledged && p.title === a.title && p.tankId === a.tankId))
        return prev;
      return [{ ...a, id: uid(), createdAt: Date.now(), acknowledged: false }, ...prev].slice(
        0,
        60,
      );
    });
  }, []);

  // Clock
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  // Weather refresh
  useEffect(() => {
    const i = setInterval(() => setWeather(generateWeather()), 45_000);
    return () => clearInterval(i);
  }, []);

  // Sensor tick
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const allowFailures = settingsRef.current.randomFailures;
      setTanks((prev) => {
        const next = { ...prev };
        for (const id of TANK_IDS) {
          const reading = stepReading(id, prev[id], allowFailures);
          const tank: TankState = {
            ...prev[id],
            ...reading,
            qualityScore: qualityScore(id, reading),
          };
          next[id] = tank;

          const label = TANK_META[id].short;
          if (reading.status === "offline" && prev[id].status !== "offline")
            pushAlert({
              tankId: id,
              severity: "critical",
              title: `${label} sensor offline`,
              detail: "No telemetry received from the ESP32 node.",
            });
          if (reading.leak && !prev[id].leak)
            pushAlert({
              tankId: id,
              severity: "critical",
              title: `Leak detected in ${label} line`,
              detail: "Flow imbalance detected between inlet and outlet sensors.",
            });
          if (reading.waterLevel < 15 && prev[id].waterLevel >= 15)
            pushAlert({
              tankId: id,
              severity: "warning",
              title: `${label} level low`,
              detail: `Level dropped to ${reading.waterLevel}%.`,
            });
          if (reading.waterLevel > 95 && prev[id].waterLevel <= 95)
            pushAlert({
              tankId: id,
              severity: "info",
              title: `${label} almost full`,
              detail: `Level at ${reading.waterLevel}% — consider routing overflow.`,
            });
          const tdsLimit = id === "rainwater" ? 180 : 1200;
          if (reading.tds > tdsLimit && prev[id].tds <= tdsLimit)
            pushAlert({
              tankId: id,
              severity: "warning",
              title: `High TDS in ${label}`,
              detail: `TDS spiked to ${reading.tds} ppm.`,
            });
          if ((reading.ph < 6.4 || reading.ph > 8.3) && prev[id].ph >= 6.4 && prev[id].ph <= 8.3)
            pushAlert({
              tankId: id,
              severity: "warning",
              title: `pH out of range in ${label}`,
              detail: `pH reading is ${reading.ph}.`,
            });
        }
        return next;
      });

      setHistory((prev) => {
        const next = { ...prev };
        for (const id of TANK_IDS) {
          const t = Date.now();
          const last = prev[id][prev[id].length - 1];
          next[id] = [
            ...prev[id].slice(-59),
            {
              t,
              label: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              waterLevel: last?.waterLevel ?? 50,
              temperature: last?.temperature ?? 25,
              ph: last?.ph ?? 7,
              tds: last?.tds ?? 100,
              turbidity: last?.turbidity ?? 3,
              flowRate: last?.flowRate ?? 4,
              saved: Math.round(40 + Math.random() * 120),
            },
          ];
        }
        return next;
      });

      setTotalSaved((v) => v + Math.round(3 + Math.random() * 12));

      if (!cancelled) {
        const base = 2000 + Math.random() * 3000;
        timer = setTimeout(tick, base / settingsRef.current.speed);
      }
    };

    timer = setTimeout(tick, 2500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pushAlert]);

  // Keep history aligned with the latest tank values
  useEffect(() => {
    setHistory((prev) => {
      const next = { ...prev };
      for (const id of TANK_IDS) {
        const arr = [...prev[id]];
        const last = arr[arr.length - 1];
        if (!last) continue;
        arr[arr.length - 1] = {
          ...last,
          waterLevel: tanks[id].waterLevel,
          temperature: tanks[id].temperature,
          ph: tanks[id].ph,
          tds: tanks[id].tds,
          turbidity: tanks[id].turbidity,
          flowRate: tanks[id].flowRate,
        };
        next[id] = arr;
      }
      return next;
    });
  }, [tanks]);

  // Recommendation engine
  useEffect(() => {
    setRecommendations((prev) => {
      const next = { ...prev };
      for (const id of TANK_IDS) {
        const rec = buildRecommendation(tanks[id]);
        if (
          prev[id].headline !== rec.headline ||
          prev[id].destination !== rec.destination ||
          Math.abs(prev[id].confidence - rec.confidence) > 6
        ) {
          next[id] = rec;
          setRecommendationLog((log) => [rec, ...log].slice(0, 80));
          pushEvent({
            type: "recommendation",
            tankId: id,
            message: `${TANK_META[id].short}: ${rec.headline} (${rec.confidence}% confidence)`,
          });
          if (modeRef.current === "autonomous" && rec.severity !== "blocked") {
            setRoutes((r) => ({ ...r, [id]: rec.destination }));
            pushEvent({
              type: "routing",
              tankId: id,
              message: `Autonomous mode routed ${TANK_META[id].short} to ${rec.destination}.`,
            });
          }
        }
      }
      return next;
    });
  }, [tanks, pushEvent]);

  const pendingRoutes = useMemo(
    () => ({
      rainwater: mode === "manual" ? null : recommendations.rainwater.destination,
      roReject: mode === "manual" ? null : recommendations.roReject.destination,
    }),
    [mode, recommendations],
  );

  const systemHealth = useMemo(() => {
    const online = TANK_IDS.filter((id) => tanks[id].status === "online").length;
    const q = (tanks.rainwater.qualityScore + tanks.roReject.qualityScore) / 2;
    const unack = alerts.filter((a) => !a.acknowledged && a.severity === "critical").length;
    return Math.max(10, Math.round(q * 0.6 + (online / 2) * 40 - unack * 6));
  }, [tanks, alerts]);

  const setMode = useCallback(
    (m: OperatingMode) => {
      setModeState(m);
      pushEvent({ type: "routing", tankId: "system", message: `Operating mode set to ${m}.` });
    },
    [pushEvent],
  );

  const setSettings = useCallback((patch: Partial<SimSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", settings.dark);
  }, [settings.dark]);

  const routeTank = useCallback(
    (tankId: TankId, destination: Destination) => {
      setRoutes((r) => ({ ...r, [tankId]: destination }));
      pushEvent({
        type: "routing",
        tankId,
        message: `${TANK_META[tankId].short} routed to ${destination}.`,
      });
    },
    [pushEvent],
  );

  const confirmSuggestion = useCallback(
    (tankId: TankId) => {
      const dest = recommendations[tankId].destination;
      routeTank(tankId, dest);
    },
    [recommendations, routeTank],
  );

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  const deviceAction = useCallback(
    (deviceId: string, action: string) => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? {
                ...d,
                lastSync: Date.now(),
                firmware:
                  action === "Firmware update"
                    ? `v${2 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}`
                    : d.firmware,
              }
            : d,
        ),
      );
      pushEvent({ type: "device", tankId: "system", message: `${action} sent to ${deviceId}.` });
    },
    [pushEvent],
  );

  const resetSimulation = useCallback(() => {
    setTanks(initTanks());
    setAlerts([]);
    setEvents([]);
    setRecommendationLog([]);
    setDevices(initDevices());
    setRoutes({ rainwater: null, roReject: null });
    setTotalSaved(18420);
    setHistory({
      rainwater: generateHistory("rainwater", 40, 900_000),
      roReject: generateHistory("roReject", 40, 900_000),
    });
    pushEvent({ type: "sensor", tankId: "system", message: "Simulation reset to baseline." });
  }, [pushEvent]);

  const value: SimContextValue = {
    tanks,
    history,
    recommendations,
    recommendationLog,
    alerts,
    events,
    devices,
    weather,
    mode,
    routes,
    pendingRoutes,
    settings,
    now,
    totalSaved,
    systemHealth,
    setMode,
    setSettings,
    routeTank,
    confirmSuggestion,
    acknowledgeAlert,
    clearAlerts,
    deviceAction,
    resetSimulation,
    pushEvent,
  };

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

export function useSimulation() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
