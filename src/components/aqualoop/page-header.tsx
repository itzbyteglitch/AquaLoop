import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid gap-4 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4 sm:items-center sm:p-5"
      style={{ backgroundImage: "var(--gradient-surface)" }}
    >
      <div className="min-w-0 overflow-hidden">
        <h1 className="truncate text-xl font-bold sm:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground break-words overflow-wrap-anywhere">
          {subtitle}
        </p>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 justify-start sm:justify-end">
          {actions}
        </div>
      )}
    </motion.header>
  );
}
