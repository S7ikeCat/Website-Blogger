"use client";

import * as React from "react";
import { cn } from "@/shared/lib/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
};

export function Textarea({ className, label, hint, error, ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      {label ? <div className="label">{label}</div> : null}
      <textarea className={cn("input min-h-[140px] resize-y", className)} {...props} />
      {error ? (
        <div className="text-sm text-rose-300">{error}</div>
      ) : hint ? (
        <div className="text-sm text-zinc-400/80">{hint}</div>
      ) : null}
    </div>
  );
}
