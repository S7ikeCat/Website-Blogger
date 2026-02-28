"use client";

import * as React from "react";
import { cn } from "@/shared/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
  rightSlot?: React.ReactNode;
};

export function Input({ className, label, hint, error, rightSlot, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label ? <div className="label">{label}</div> : null}
      <div className="relative">
        <input className={cn("input pr-10", className)} {...props} />
        {rightSlot ? <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300">{rightSlot}</div> : null}
      </div>
      {error ? (
        <div className="text-sm text-rose-300">{error}</div>
      ) : hint ? (
        <div className="text-sm text-zinc-400/80">{hint}</div>
      ) : null}
    </div>
  );
}
