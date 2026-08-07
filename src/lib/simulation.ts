import type {
  Destination,
  HistoryPoint,
  Recommendation,
  SensorReading,
  TankId,
  TankState,
  WeatherState,
} from "@/types/aqualoop";

export const TANK_META: Record<TankId, { name: string; short: string; capacityLiters: number }> = {
  rainwater: { name: "Rainwater Tank", short: "Rainwater", capacityLiters: 5000 },
  roReject: { name: "RO Reject Water Tank", short: "RO Reject", capacityLiters: 2000 },
};

export const RANGES: Record<
  TankId,
  Record<"waterLevel" | "temperature" | "ph" | "tds" | "turbidity" | "flowRate", [number, number]>
> = {
  rainwater: {
    waterLevel: [20, 100],
    temperature: [20, 35],
    ph: [6.5, 8.2],
    tds: [30, 250],
    turbidity: [1, 20],
    flowRate: [0, 18],
  },
  roReject: {
    waterLevel: [10, 100],
    temperature: [22, 38],
    ph: [6.0, 8.5],
    tds: [300, 1800],
    turbidity: [0, 8],
    flowRate: [0, 15],
  },
};

export const rand = (min: number, max: number) => min + Math.random() * (max - min);
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const round = (v: number, d = 1) => Number(v.toFixed(d));
export const uid = () => Math.random().toString(36).slice(2, 10);

/** Nudge a value within range with a gentle random walk. */
function drift(current: number, [min, max]: [number, number], volatility = 0.06, decimals = 1) {
  const span = max - min;
  const next = current + rand(-1, 1) * span * volatility;
  return round(clamp(next, min, max), decimals);
}

export function initialReading(tankId: TankId): SensorReading {
  const r = RANGES[tankId];
  return {
    waterLevel: round(rand(45, 85)),
    temperature: round(rand(r.temperature[0], r.temperature[1])),
    ph: round(rand(r.ph[0], r.ph[1]), 2),
    tds: Math.round(rand(r.tds[0], r.tds[1] * 0.6)),
    turbidity: round(rand(r.turbidity[0], r.turbidity[1] * 0.5), 1),
    flowRate: round(rand(0, r.flowRate[1] * 0.5), 1),
    leak: false,
    battery: round(rand(65, 100)),
    wifi: Math.round(rand(-72, -42)),
    lastUpdated: Date.now(),
    status: "online",
  };
}

export function initialTank(tankId: TankId): TankState {
  const reading = initialReading(tankId);
  return {
    id: tankId,
    name: TANK_META[tankId].name,
    capacityLiters: TANK_META[tankId].capacityLiters,
    qualityScore: qualityScore(tankId, reading),
    ...reading,
  };
}

export function stepReading(
  tankId: TankId,
  prev: SensorReading,
  allowFailures: boolean,
): SensorReading {
  const r = RANGES[tankId];
  let status = prev.status;
  let leak = prev.leak;

  if (allowFailures) {
    if (status !== "online" && Math.random() < 0.35) status = "online";
    else if (status === "online" && Math.random() < 0.02) status = "offline";
    else if (status === "online" && Math.random() < 0.03) status = "degraded";
    if (leak && Math.random() < 0.3) leak = false;
    else if (!leak && Math.random() < 0.025) leak = true;
  } else {
    status = "online";
    leak = false;
  }

  if (status === "offline") {
    return { ...prev, status, leak, lastUpdated: prev.lastUpdated };
  }

  const spike = allowFailures && Math.random() < 0.06;

  let tds = drift(prev.tds, r.tds, 0.08, 0);
  let turbidity = drift(prev.turbidity, r.turbidity, 0.12, 1);
  let ph = drift(prev.ph, r.ph, 0.05, 2);
  if (spike) {
    const which = Math.floor(rand(0, 3));
    if (which === 0) tds = Math.round(clamp(tds * 1.6, r.tds[0], r.tds[1]));
    if (which === 1) turbidity = round(clamp(turbidity * 2, r.turbidity[0], r.turbidity[1]), 1);
    if (which === 2) ph = round(Math.random() < 0.5 ? r.ph[0] : r.ph[1], 2);
  }

  let waterLevel = drift(prev.waterLevel, r.waterLevel, 0.05);
  if (allowFailures && Math.random() < 0.03) waterLevel = round(rand(96, 100));
  if (allowFailures && Math.random() < 0.02) waterLevel = round(rand(r.waterLevel[0], 15));

  return {
    waterLevel,
    temperature: drift(prev.temperature, r.temperature, 0.04),
    ph,
    tds,
    turbidity,
    flowRate: drift(prev.flowRate, r.flowRate, 0.25, 1),
    leak,
    battery: round(clamp(prev.battery - rand(0, 0.08), 12, 100)),
    wifi: Math.round(clamp(prev.wifi + rand(-3, 3), -88, -35)),
    lastUpdated: Date.now(),
    status,
  };
}

export function qualityScore(tankId: TankId, r: SensorReading): number {
  const range = RANGES[tankId];
  const phPenalty = Math.abs(r.ph - 7.2) * 9;
  const tdsPenalty = (r.tds / range.tds[1]) * 38;
  const turbPenalty = (r.turbidity / Math.max(range.turbidity[1], 1)) * 26;
  const leakPenalty = r.leak ? 12 : 0;
  const offlinePenalty = r.status === "offline" ? 25 : r.status === "degraded" ? 8 : 0;
  return Math.round(
    clamp(100 - phPenalty - tdsPenalty - turbPenalty - leakPenalty - offlinePenalty, 5, 100),
  );
}

export function buildRecommendation(tank: TankState): Recommendation {
  const reasoning: string[] = [];
  let destination: Destination = "Holding / No Use";
  let severity: Recommendation["severity"] = "good";
  let headline = "";
  let action = "";
  let benefit = "";
  let confidence = 70;

  const highTds = tank.tds > (tank.id === "rainwater" ? 180 : 1200);
  const badPh = tank.ph < 6.4 || tank.ph > 8.3;
  const highTurbidity = tank.turbidity > (tank.id === "rainwater" ? 12 : 5);

  if (tank.status === "offline") {
    destination = "Holding / No Use";
    severity = "blocked";
    headline = "Inspect sensor calibration.";
    reasoning.push("Sensor node is not reporting — readings are stale.");
    action = "Restart the ESP32 node and verify WiFi link quality.";
    benefit = "Restores telemetry accuracy and prevents unsafe routing.";
    confidence = 96;
  } else if (highTds) {
    destination = tank.id === "rainwater" ? "Holding / No Use" : "Floor Cleaning";
    severity = "blocked";
    headline = "Do not use due to high TDS.";
    reasoning.push(`TDS measured at ${tank.tds} ppm, above the safe reuse threshold.`);
    if (badPh) reasoning.push(`pH of ${tank.ph} is outside the 6.5–8.2 comfort band.`);
    action = "Divert to holding and dilute or pass through the sediment stage.";
    benefit = "Protects soil salinity and downstream plumbing from scaling.";
    confidence = 91;
  } else if (highTurbidity) {
    destination = "Holding / No Use";
    severity = "caution";
    headline = "Wait until turbidity decreases.";
    reasoning.push(`Turbidity at ${tank.turbidity} NTU — suspended solids still settling.`);
    action = "Hold for 30–45 minutes and re-evaluate after settling.";
    benefit = "Avoids clogging drip emitters and flush valves.";
    confidence = 84;
  } else if (badPh) {
    destination = "Groundwater Recharge";
    severity = "caution";
    headline = "Poor pH — route to recharge only.";
    reasoning.push(`pH of ${tank.ph} is outside the ideal irrigation window.`);
    action = "Send to the recharge pit where soil buffering neutralises pH.";
    benefit = "Recovers the volume without risking crop stress.";
    confidence = 79;
  } else if (tank.id === "rainwater") {
    destination = tank.tds < 90 ? "Irrigation" : "Toilet Flushing";
    severity = "good";
    headline =
      destination === "Irrigation" ? "Suitable for irrigation." : "Suitable for toilet flushing.";
    reasoning.push(`TDS ${tank.tds} ppm and pH ${tank.ph} are within reuse limits.`);
    reasoning.push(`Turbidity ${tank.turbidity} NTU is clear enough for direct reuse.`);
    action = `Open the ${destination.toLowerCase()} valve for the next cycle.`;
    benefit = "Offsets fresh municipal water litre-for-litre.";
    confidence = 93;
  } else {
    destination = tank.tds < 800 ? "Toilet Flushing" : "Groundwater Recharge";
    severity = "good";
    headline =
      destination === "Toilet Flushing"
        ? "Suitable for toilet flushing."
        : "Recommended for groundwater recharge.";
    reasoning.push(`RO reject TDS ${tank.tds} ppm is acceptable for non-potable reuse.`);
    reasoning.push(`pH ${tank.ph} within tolerance, turbidity ${tank.turbidity} NTU is low.`);
    action = `Route the reject line to ${destination.toLowerCase()}.`;
    benefit = "Recovers water that would otherwise go straight to drain.";
    confidence = 88;
  }

  if (tank.leak) {
    reasoning.push("Leak sensor is active — verify plumbing before routing.");
    confidence = Math.max(50, confidence - 18);
  }
  if (tank.waterLevel < 15) {
    reasoning.push(`Level is low at ${tank.waterLevel}% — limited volume available.`);
    confidence = Math.max(50, confidence - 10);
  }

  return {
    id: uid(),
    tankId: tank.id,
    destination,
    headline,
    confidence: Math.round(confidence),
    reasoning,
    action,
    benefit,
    createdAt: Date.now(),
    severity,
  };
}

export function generateHistory(tankId: TankId, points: number, stepMs: number): HistoryPoint[] {
  const r = RANGES[tankId];
  let reading = initialReading(tankId);
  const now = Date.now();
  const out: HistoryPoint[] = [];
  for (let i = points - 1; i >= 0; i--) {
    reading = stepReading(tankId, reading, false);
    const t = now - i * stepMs;
    out.push({
      t,
      label: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      waterLevel: reading.waterLevel,
      temperature: reading.temperature,
      ph: reading.ph,
      tds: reading.tds,
      turbidity: reading.turbidity,
      flowRate: reading.flowRate,
      saved: round(rand(r.flowRate[0], r.flowRate[1]) * 12, 0),
    });
  }
  return out;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

export const weeklyTrend = DAYS.map((day) => ({
  label: day,
  rainwater: Math.round(rand(180, 620)),
  roReject: Math.round(rand(90, 340)),
}));

export const monthlyTrend = MONTHS.map((label) => ({
  label,
  rainwater: Math.round(rand(2400, 8200)),
  roReject: Math.round(rand(1200, 4100)),
}));

export const dailyUsage = Array.from({ length: 12 }, (_, i) => ({
  label: `${String(i * 2).padStart(2, "0")}:00`,
  irrigation: Math.round(rand(0, 90)),
  flushing: Math.round(rand(0, 70)),
  recharge: Math.round(rand(0, 55)),
}));

export function generateWeather(): WeatherState {
  const conditions: WeatherState["condition"][] = [
    "Sunny",
    "Cloudy",
    "Light Rain",
    "Heavy Rain",
    "Thunderstorm",
  ];
  return {
    condition: conditions[Math.floor(rand(0, conditions.length))]!,
    temperature: round(rand(22, 36)),
    humidity: Math.round(rand(40, 92)),
    rainChance: Math.round(rand(5, 95)),
    forecast: DAYS.slice(0, 5).map((day) => ({
      day,
      rainChance: Math.round(rand(5, 95)),
      temp: Math.round(rand(21, 37)),
    })),
  };
}

export function formatAgo(ts: number, now: number) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
