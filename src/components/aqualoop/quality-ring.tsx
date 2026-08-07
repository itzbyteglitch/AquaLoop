import { motion } from "framer-motion";

export function QualityRing({
  score,
  label = "Water Quality",
  size = 100,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const color =
    score >= 75
      ? "var(--color-success)"
      : score >= 50
        ? "var(--color-warning)"
        : "var(--color-destructive)";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={8}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
            transition={{ type: "spring", stiffness: 50, damping: 16 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="font-display text-xl font-bold">{score}</p>
            <p className="text-[10px] text-muted-foreground">/ 100</p>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
