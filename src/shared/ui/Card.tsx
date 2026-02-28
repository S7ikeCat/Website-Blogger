import * as React from "react";
import { cn } from "@/shared/lib/cn";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function CardSolid({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("card-solid", className)}>{children}</div>;
}
