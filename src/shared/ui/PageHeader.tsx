import * as React from "react";
import { cn } from "@/shared/lib/cn";

export function PageHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        <div className="text-3xl font-bold tracking-tight">{title}</div>
        {subtitle ? <div className="muted mt-2 max-w-2xl text-sm">{subtitle}</div> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}
