import { motion } from "framer-motion";

export function QualityRing({
  score,
  label = "Water Quality",
  size = 132,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const color =
    score >= 75
      ? "var(--color-success)"
      : score >= 50
        ? "var(--color-warning)"
        : "var(--color-destructive)";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={10}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ type: "spring", stiffness: 50, damping: 16 }}
        />
      </svg>
      <div className="-mt-[calc(50%+8px)] mb-[calc(25%)] text-center">
        <p className="font-display text-2xl font-bold">{score}</p>
        <p className="text-[11px] text-muted-foreground">/ 100</p>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
