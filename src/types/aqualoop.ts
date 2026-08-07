export type TankId = "rainwater" | "roReject";

export type DeviceStatus = "online" | "offline" | "degraded";

export interface SensorReading {
  waterLevel: number;
  temperature: number;
  ph: number;
  tds: number;
  turbidity: number;
  flowRate: number;
  leak: boolean;
  battery: number;
  wifi: number;
  lastUpdated: number;
  status: DeviceStatus;
}

export interface TankState extends SensorReading {
  id: TankId;
  name: string;
  capacityLiters: number;
  qualityScore: number;
}

export type Destination =
  "Irrigation" | "Toilet Flushing" | "Groundwater Recharge" | "Floor Cleaning" | "Holding / No Use";

export interface Recommendation {
  id: string;
  tankId: TankId;
  destination: Destination;
  headline: string;
  confidence: number;
  reasoning: string[];
  action: string;
  benefit: string;
  createdAt: number;
  severity: "good" | "caution" | "blocked";
}

export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertItem {
  id: string;
  tankId: TankId;
  severity: AlertSeverity;
  title: string;
  detail: string;
  createdAt: number;
  acknowledged: boolean;
}

export type EventType = "recommendation" | "sensor" | "routing" | "alert" | "device" | "quality";

export interface EventItem {
  id: string;
  type: EventType;
  tankId: TankId | "system";
  message: string;
  createdAt: number;
}

export type OperatingMode = "manual" | "assisted" | "autonomous";

export interface DeviceInfo {
  id: string;
  tankId: TankId;
  name: string;
  firmware: string;
  lastSync: number;
  uptimeHours: number;
}

export interface HistoryPoint {
  t: number;
  label: string;
  waterLevel: number;
  temperature: number;
  ph: number;
  tds: number;
  turbidity: number;
  flowRate: number;
  saved: number;
}

export interface WeatherState {
  condition: "Sunny" | "Cloudy" | "Light Rain" | "Heavy Rain" | "Thunderstorm";
  temperature: number;
  humidity: number;
  rainChance: number;
  forecast: { day: string; rainChance: number; temp: number }[];
}
